'use strict';
import firebase from "react-native-firebase";
import RNFS from 'react-native-fs';
import yaml from 'js-yaml';

import {base64ToHex} from "./convert";


export class FileError extends Error{
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
    if(typeof path !=="string") throw new Error(`path must be a string. Got ${typeof path}`);
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

export async function signIn(mail, password){
    return await firebase.auth().signInWithEmailAndPassword(mail, password);
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
    let categories = [];
    try{
        const categoriesSnapshot = await categoriesRef.get();
        categories = categoriesSnapshot.docs;
    }catch(e){
        //Ignore missing categories
    }
   
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
    await saveDataFile(datastore);
    return datastore;
}

async function saveDataFile(data){
    let old_data;
    try{
        old_data = await initialize();
    }catch(e){
        console.warn("initialize error : ",e);
        old_data = {};
    }
    const datastore = Object.assign(old_data, data);
    try{
        await RNFS.writeFile(`${storagePath}/data.json`, JSON.stringify(datastore), 'utf8')
    }catch(e){
        throw new FileError(`${storagePath}/data.json`, e.message);
    }
}

export async function watchFiles({
    projectName, 
    dispatch,
    onProgress=function(){},
}={}){
    let cache;
    let errors = [];
    let unsubscribes = [];
    if(!projectName){
        throw new Error(`A valid projectName is required. Got ${projectName}`);
    }
    
    const db = firebase.firestore();

    const projectRef = db.collection("applications").doc(projectName);
    const collectionsRef = projectRef.collection("projects");

    const storage = firebase.storage();
    const storageRef = storage.ref();
    const mainFolderRef = storageRef.child(projectName);

        //Create base directory. Does not throw if it does exist
    await RNFS.mkdir(storagePath);

    let abortConfig;
    unsubscribes.push(projectRef.onSnapshot(
        (configSnapshot)=>{
            if(abortConfig) abortConfig.abort(); //Cancel any previous run
            abortConfig = new AbortController();
            onConfigSnapshot(configSnapshot, {signal: abortConfig.signal, onProgress, projectRef, dispatch})
            
        },
        (e) => onProgress("Can't get project snapshot for "+projectName+" :", e)
      ))
    let abortProject;
    unsubscribes.push(collectionsRef.onSnapshot(
        (projectSnapshot)=>{
            if(abortProject) abortProject.abort();
            abortProject = new AbortController();
            onProjectSnapshot(projectSnapshot, {signal: abortProject.signal, onProgress, projectRef, dispatch});
        },
        (e) => onProgress("Can't get project snapshot for "+projectName+" :", e)
    ))
    return ()=>{
        unsubscribes.forEach(fn=> fn());
    }
}


async function onConfigSnapshot(configSnapshot, {signal, onProgress, projectRef, dispatch}) {
    const categoriesRef = projectRef.collection("categories");
    if(!configSnapshot.exists){
        console.warn("Application has no configuration set. Using defaults.");
    }
    const config = configSnapshot.exists ? configSnapshot.data():{};
    try{
        await makeLocal(config);
    }catch(e){
        return onProgress("Failed to fetch config resources : ", e);
    }
    if(signal && signal.aborted) return //Don't do nothing on abort
    let categories = [];
    try{
        const categoriesSnapshot = await categoriesRef.get();
        categories = categoriesSnapshot.docs;
    }catch(e){
        //Ignore becasue it's sometimes OK to not have a categories collection
        //onProgress("Failed to get categories snapshot", e);
    }
    config.categories = (Array.isArray(config.categories))? config.categories.map(c =>{return {name: c}}) : [];
    for (let category of categories){
        const c = category.data();
        const [new_errors, new_files] = await makeLocal(c);
        if(signal && signal.aborted) return;
        errors = errors.concat(new_errors);
        config.categories.push(c);
    }
    if(signal && signal.aborted) return
    await saveDataFile({config});
    dispatch({config});
    onProgress("Updated config to :", config);
}

async function onProjectSnapshot(projectsSnapshot, {signal, onProgress, projectRef, dispatch}){
    const items = {};
    const projects = projectsSnapshot.docs;
    if(projects.length == 0){
        throw new Error(`no project found in ${projectRef.id}`);
    }
    for (let s of projects){
        const d = s.data();
        if(d.active === false) continue;
        items[s.id] = d;
        await makeLocal(d);
        if(signal && signal.aborted) return
    }
    await saveDataFile({items});
    dispatch({items});
    onProgress("Updated items to : ", items);
}

async function makeLocal(d, {onProgress=function(){}, force=false, signal}={}){
    const filelist = [];
    const errors = [];
    const storage = firebase.storage();
    for(let key in d){
        if(signal && signal.aborted) return;
        if(typeof d[key] === "string" && d[key].indexOf("gs://") == 0 && !d[key].endsWith("/")){
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

export function dedupeList(uploads, list=[]){
    // Remove existing files
    const filteredUploads = uploads.filter((file, index)=>{
        if(list.findIndex((i) => i.name == file.name &&(!file.hash || file.hash == (i.conf || {}).md5)) !== -1) {
            return false;
        }else if(uploads.findIndex((i)=> i.name == file.name && i.uri == file.uri )!= index){
            return false;
        }else{
            return true;
        }
    })
    //Check for duplicates
    const dupes = filteredUploads.filter((file, index)=>{
        return filteredUploads.findIndex((i)=> i.name == file.name)!= index;
    })
    if(dupes.length !=0) throw new Error("found duplicates : "+ dupes.map(d=>d.name).join("\n"));

    return filteredUploads;
}

export async function uploadFile(url, file){
    //It's a bad pattern but react-native's XMLHttpRequest implementation will randomly throw on missing file
    if(!await RNFS.exists(file.uri)){
        console.warn("File ",file.uri,"does not exists");
        throw new FileError(file.uri, "File does not exists");
    }
    const form = new FormData();
    form.append("file", file);
    try{
        let response = await fetch(`${url}/medias`, {
            body: form,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            }
        });
        let body = await response.json();
        if (!response.ok) {
            if(body.message){
                console.warn("Body : ", body);
                throw new FileError(file.uri, (typeof body.message == 'object')? JSON.stringify(body.message): body.message);
            }else{
                throw new FileError(file.uri, response.statusText);
            }
        }
        const hash = await RNFS.hash(file.uri, 'md5');
        response = await fetch(`${url}/playlist`, {
            method: "PUT",
            headers:{
                'Accept': 'application/json',
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query:{name: file.name},
                modifier:{ $set:{
                    conf:{md5: hash}
                }},
            })
        });
        body = await response.json();
        if (!response.ok) {
            if(body.message){
                console.warn("Body : ", body);
                throw new FileError(file.uri, (typeof body.message == 'object')? JSON.stringify(body.message): body.message);
            }else{
                throw new FileError(file.uri, response.statusText);
            }
        }
    }catch(e){
        throw new FileError(file.uri, e.message);
    }
}

