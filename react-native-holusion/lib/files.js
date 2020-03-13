'use strict';
import firebase from "@react-native-firebase/app";
import functions from "@react-native-firebase/functions";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
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

export async function signIn(uuid, applications, meta){
    const func = firebase.app().functions("europe-west1").httpsCallable("https_authDeviceCall")
    let {data: token} = await func({uuid:uuid, applications, meta});
    console.warn("Custom token : ", token);
    return await auth().signInWithCustomToken(token);
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
    const db = firestore();
    const projectRef = db.collection("applications").doc(projectName);
    const collectionsRef = projectRef.collection("projects");
    const categoriesRef = projectRef.collection("categories");
    const storageRef = storage().ref();
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
   
    config.categories = (Array.isArray(config.categories))? config.categories.map(c =>{
        return (typeof c === "string")? {name: c} : c;
    }) : [];
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
    //await saveDataFile(datastore);
    return datastore;
}

async function saveDataFile(data){
    let dataStr = typeof data === "string" ? data : JSON.stringify(data);
    try{
        await RNFS.writeFile(`${storagePath}/data.json`, dataStr, 'utf8')
    }catch(e){
        throw new FileError(`${storagePath}/data.json`, e.message);
    }
}

let pending_saves = [];
let is_saving = false;
export async function saveDataFileSerial(data){
    pending_saves.push(data)
    if(is_saving) return;
    is_saving = true;
    try{
        while(0 < pending_saves.length){
            const d = pending_saves.pop();
            pending_saves = []; // Delete all intermediate data representations
            await saveDataFile(data);
            await delay(1000);
        }
    }finally{
        is_saving = false;
    } 
}

export async function watchFiles({
    projectName, 
    dispatch,
    onProgress=function(){},
    onUpdate=function(){},
}={}){
    let cache;
    let errors = [];
    let unsubscribes = [];
    if(!projectName){
        throw new Error(`A valid projectName is required. Got ${projectName}`);
    }
    
    const db = firestore();

    const projectRef = db.collection("applications").doc(projectName);
    const collectionsRef = projectRef.collection("projects");

    const storageRef = storage().ref();
    const mainFolderRef = storageRef.child(projectName);

        //Create base directory. Does not throw if it does exist
    await RNFS.mkdir(storagePath);

    let abortConfig;
    unsubscribes.push(projectRef.onSnapshot(
        (configSnapshot)=>{
            if(abortConfig) abortConfig.abort(); //Cancel any previous run
            abortConfig = new AbortController();
            onUpdate(configSnapshot);
            onConfigSnapshot(configSnapshot, {signal: abortConfig.signal, onProgress, projectRef, dispatch})
            
        },
        (e) => onProgress("Can't get project snapshot for "+projectName+" :", e)
      ))
    let abortProject;
    unsubscribes.push(collectionsRef.onSnapshot(
        (projectSnapshot)=>{
            if(abortProject) abortProject.abort();
            abortProject = new AbortController();
            onUpdate(projectSnapshot);
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
    config.categories = (Array.isArray(config.categories))? config.categories.map(c =>{
        return (typeof c === "string")? {name: c} : c;
    }) : [];
    for (let category of categories){
        const c = category.data();
        const [new_errors, new_files] = await makeLocal(c);
        if(signal && signal.aborted) return;
        errors = errors.concat(new_errors);
        config.categories.push(c);
    }
    if(signal && signal.aborted) return
    //await saveDataFile({config});
    dispatch({config});
    onProgress("Updated configuration");
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
    //await saveDataFile({items});
    dispatch({items});
    onProgress("Updated item collections");
}

async function makeLocal(d, {onProgress=function(){}, force=false, signal}={}){
    let filelist = [];
    let errors = [];
    for(let key in d){
        if(signal && signal.aborted) return;
        if(typeof d[key] === "string" && d[key].indexOf("gs://") == 0 && !d[key].endsWith("/") && key !== 'repo'){
            const ref = storage().refFromURL(d[key]);
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
                        console.warn("Uptodate check failed : ", e.message);
                    }
                }
            }
            
            if(!uptodate){
                onProgress(`Downloading ${fullPath}`);
                try{
                    await ref.writeToFile(dest);
                }catch(e){
                    console.warn("Download error on %s : ", fullPath, e.message);
                    if(e.code )
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
                    console.warn("loadYaml error on %s : ", fullPath, e.message);
                    errors.push(new FileError(fullPath,`failed to parse ${fullPath} : ${e.message}`));
                }
               
            }else{
                d[key] = `file://${dest}`;
            }
        }else if(typeof d[key] === "object"){
            const [new_errors, new_filelist] = await makeLocal(d[key]);
            errors = errors.concat(new_errors);
            filelist = filelist.concat(new_filelist);
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
        const idx = list.findIndex((i) => {
            if(i.name !== file.name) return false;
            if(typeof i.conf !== "object" || !i.conf.mtime) return false;
            return file.mtime.getTime() === (new Date(i.conf.mtime)).getTime();
        });
        if(idx !== -1) {
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

export function sendFiles({target, videos=[], onStatusChange=console.warn.bind(null, "sendFiles status change : "), purge=false}){
    const abortController = new AbortController();
    if(!target){
        return onStatusChange({status: "error", statusText: "no target product selected"})
    }
    if(typeof target !== "object" || ! target.url){
        return onStatusChange({status:"error", statusText: "bad target product provided"});
    }
    onStatusChange({status: "loading", statusText: "fetching playlist"});
    const url = `http://${target.url}`;
    const op = fetch(`${url}/playlist`, {
        method:"GET",
        signal: abortController.signal
    })
    .then(async r =>{
        const list = await r.json();
        console.warn("List : ", list);
        let uploads = [];
        const errors = [];
        if(!r.ok){
            return onStatusChange({status: "error", statusText: list.message});
        }
        for(const video of videos){
            uploads.push({
                uri: `${video}`,
                name: filename(video),
                type: "video/mp4"
            })
        }

        onStatusChange({status: "loading", statusText: "Getting modification time"});
        //Can throw an error but we don't want to catch it here
        const uploads_with_mtime = [];
        //Don't parallelize : it cause iOS to crash the app
        for (let upload of uploads){
            const stat = await RNFS.stat(upload.uri);
            uploads_with_mtime.push(Object.assign({mtime:stat.mtime}, upload))
            if(abortController.signal.aborted){
                let e = new Error("Transfer aborted during files.stat");
                e.name = "AbortError";
                throw e;
            }
        }

        const unique_uploads = dedupeList(uploads_with_mtime, list);
        onStatusChange({status: "loading", statusText: "Uploading files"});
        for (const file of unique_uploads){
            try{
                if(list.find(i=>i.name == file.name)){
                    onStatusChange({status: "loading", statusText: "Deleting old "+ file.name});
                    await fetch(`${url}/medias/${file.name}`, {method: "DELETE", signal: abortController.signal});
                }
                onStatusChange({status:"loading",statusText: "Uploading "+ file.name});
                await uploadFile(url, file, abortController.signal);
            } catch(e){
                if(e.name === "AbortError") throw e;
                console.warn(e);
                errors.push(e);
            }
        }
        let statusText;
        if(unique_uploads.length == 0 ){
            statusText = "Rien à envoyer\n";
        }else{
            statusText = "Synchronisé :\n";
            statusText += unique_uploads.slice(0, 5).map(f=> (`${f.name} Envoyé`)).join("\n")
            if(5 < unique_uploads.length){
                statusText += `Et ${unique_uploads.length - 5} autres`;
            }
        }

        if(purge === true){
            const unused_items = list.filter((i)=>{
                return uploads.findIndex(u=> u.name == i.name) === -1;
            })
            for(let item of unused_items){
                try{
                    await fetch(`${url}/medias/${item.name}`, {method: "DELETE", signal: abortController.signal});
                }catch(e){
                    if(e.name == "AbortError") throw e;
                    console.warn(e);
                    errors.push(e);
                }
            }
            let s = 1 < unused_items.length?"s":""
            statusText += `${unused_items.length} ancienne${s} vidéo${s} supprimée${s}\n`;
        } 


        if(0 < errors.length){
            console.warn('Errors : ', errors);
            return onStatusChange({status: "error", statusText: errors.map(e=>`${e.sourceFile} : ${e.message}`).join("\n")});
        }
        onStatusChange({status: "idle", statusText});
        
    }).catch(e=>{
        if(e.name === "AbortError"){
            return console.warn("Aborted files transfer to product");// Do nothing : component doesn't wan't any updates after abort.
        }
        console.warn("Caught error : ", e);
        onStatusChange({status: "error", statusText: "Error : "+e.message});
    });

    return [abortController.abort.bind(abortController), op];
}

export async function uploadFile(url, file, signal){
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
            },
            signal: signal,
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
        if(file.mtime){
            response = await fetch(`${url}/playlist`, {
                method: "PUT",
                signal: signal,
                headers:{
                    'Accept': 'application/json',
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query:{name: file.name},
                    modifier:{ $set:{
                        conf:{mtime: file.mtime}
                    }},
                })
            });
            body = await response.json();
            if (!response.ok) {
                if(body.message){
                    throw new FileError(file.uri, (typeof body.message == 'object')? JSON.stringify(body.message): body.message);
                }else{
                    throw new FileError(file.uri, `Failed to get ${url}/playlist : ${response.statusText}`);
                }
            }
        }
    }catch(e){
        if(e.name === "AbortError") throw e;
        throw new FileError(file.uri, e.message);
    }
}

