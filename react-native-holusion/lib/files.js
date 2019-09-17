'use strict';
import firebase from "react-native-firebase";
import RNFS from 'react-native-fs';
import yaml from 'js-yaml';

import {base64ToHex} from "./convert";

//let files = await RNFS.readDir(`${RNFS.DocumentDirectoryPath}/${projectName}`);


class FileError extends Error{
    constructor(sourceFile, message){
        super(message);
        this.sourceFile = sourceFile;
    }
}

import {delay} from "./time";

export const basePath = `${RNFS.DocumentDirectoryPath}`;
export const storagePath = `${basePath}/storage`;

export async function loadFile(name){
    return await RNFS.readFile(`${storagePath}/${name}`, 'utf8');
    
}
export async function loadYaml(name){
    const fileData = await loadFile(name);
    return yaml.safeLoad(fileData);
}
export function filename(path){
    return path.split("/").slice(-1)[0];
}

export function initialize(projectName){
    return loadFile("data.json")
    .then(data => JSON.parse(data))
    .then((data)=>{
        return data;
    })
    .catch((err)=>{
        if(err.code == "ENOENT"){
            throw new Error("Application is not configured yet");
        }
        throw new Error(`Application has an invalid configuration : ${err.toString()}`)
    });
}

export async function getFiles({
    projectName, 
    signal /* :AbortSignal */,
    onProgress=function(){}, 
    force=false,
}={}){
    let cache;
    let data = {};
    let errors = [];
    let filelist = [
        `${storagePath}/data.json`
    ];
    if(!projectName){
        throw new Error(`A valid projectName is required. Got ${projectName}`);
    }
    const credentials = await firebase.auth().signInAnonymously();
    const db = firebase.firestore();
    const projectRef = db.collection("applications").doc(projectName);
    const collectionsRef = projectRef.collection("projects");
    const categoriesRef = projectRef.collection("categories");
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const mainFolderRef = storageRef.child(projectName);

    //Create base directory. Does not throw if it doesn't exist
    await RNFS.mkdir(storagePath);

    onProgress(` Downloading applications/${projectName}`);
    const configSnapshot = await projectRef.get();
    if(!configSnapshot.exists){
        console.warn("Application has no configuration set. Using defaults.");
    }
    const config = configSnapshot.exists ? configSnapshot.data():{};

    //Fetch config
    const [new_errors, new_files] = await makeLocal(config, {onProgress, force});
    errors = errors.concat(new_errors);
    filelist = filelist.concat(new_files);

    //Fetch optionnal categories collection
    const categoriesSnapshot = await categoriesRef.get();
    const categories = categoriesSnapshot.docs;
    config.categories = (Array.isArray(config.categories))? config.categories.map(c =>{return {name: c}}) : [];
    for (let category of categories){
        if(signal && signal.aborted) return {aborted : true};
        const c = category.data();
        const [new_errors, new_files] = await makeLocal(c, {onProgress, force});
        errors = errors.concat(new_errors);
        filelist = filelist.concat(new_files);
        config.categories.push(c);
    }

    const projectsSnapshot = await collectionsRef.get();
    const projects = projectsSnapshot.docs;
    if(projects.length == 0){
        throw new Error(`no project found in ${projectName}`);
    }
    for (let s of projects){
        if(signal && signal.aborted) return {aborted : true};
        const d = s.data();
        if(d.active === false) continue;
        data[s.id] = d;
        const [new_errors, new_files] = await makeLocal(d, {onProgress, force});
        errors = errors.concat(new_errors);
        filelist = filelist.concat(new_files);
    }

    //Cleanup
    onProgress("Cleaning Up");
    try{
        await cleanup(storagePath, filelist);
    }catch(e){
        throw new Error("Cleanup error :" + e.message);
    }
    
    
    if(errors.length == 1){
        throw errors[0]
    }else if (1 < errors.length){
        throw new Error(`Multiple fetch errors : ${errors.join(', ')}`);
    }
    //console.warn("Stringified store : ", JSON.stringify({items: data, config: config}))
    const datastore = {items: data, config: config};
    try{
        await RNFS.writeFile(`${storagePath}/data.json`, JSON.stringify(datastore), 'utf8')
    }catch(e){
        throw new FileError(`${storagePath}/data.json`, e.message);
    }
    return datastore;
}

async function makeLocal(d, {onProgress, force}){
    const filelist = [];
    const errors = [];
    const storage = firebase.storage();
    for(let key in d){
        if(typeof d[key] === "string" && d[key].indexOf("gs://") == 0){
            const ref = storage.refFromURL(d[key]);
            const fullPath = ref.fullPath.slice(10); //fullPath starts with : 'url::gs://'
            const name = filename(fullPath);
            const dest = `${storagePath}/${fullPath}`;
            onProgress(`Checking out ${name}`);
            let uptodate = false;
            if(!force){
                try{
                    const [localHash, {md5Hash}] = await Promise.all([RNFS.hash(dest, 'md5'), ref.getMetadata()]);
                    if(md5Hash && localHash.toUpperCase() === base64ToHex(md5Hash)){
                        uptodate = true;
                    }else{
                        console.warn("Download updated version for "+dest+" : hashes mismatch")
                    }
                }catch(e){
                    if(e.code != "ENOENT"){
                        console.warn("Uptodate check failed : ", e);
                    }
                }
            }
            
            if(!uptodate){
                onProgress(`Downloading ${name}`);
                try{
                    await ref.downloadFile(dest);
                }catch(e){
                    console.warn("Download error on %s : ", name, e);
                    if(e.code == "storage/object-not-found"){
                        errors.push(new FileError(name, `${name} could not be found at ${ref.fullPath}`))
                    }else{
                        errors.push(new FileError(name, `${e.code} - ${e.message}`));
                    }
                }
            }else{
                onProgress(`Up to date ${name}`);
            }
            filelist.push(dest);
            
            if(key == "ref"){
                try{
                    const fileData = await loadYaml(`${fullPath}`);
                    for(let key in fileData){
                        d[key.toLowerCase().replace(/\s/,"_")] = fileData[key];
                    }
                }catch(e){
                    console.warn("loadYaml error on %s : ", fullPath, e);
                    errors.push(new FileError(fullPath,`failed to parse ${fullPath} : ${e.message}`));
                }
               
            }else{
                d[key] = `file://${dest}`;
            }
        }
    }
    return [errors, filelist];
}

async function cleanup(dir=storagePath, keep=[]){
    let localFiles;
    try{
        localFiles = await RNFS.readDir(dir);
    }catch(e){
        throw new FileError(dir,e.message);
    }
    for(let file of localFiles){ 
        if(file.isDirectory()){
            if(keep.filter(path => file.path.indexOf(path) == -1).length == 0){
                await RNFS.unlink(file.path);
            }else{
                await cleanup(file.path, keep);
            }
        } else if(keep.indexOf(file.path) == -1){
            await RNFS.unlink(file.path);
        }
    }
}
