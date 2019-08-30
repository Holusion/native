'use strict';
import firebase from "react-native-firebase";
import RNFS from 'react-native-fs';
import yaml from 'js-yaml';

import {name as projectName} from "../../package.json"
//let files = await RNFS.readDir(`${RNFS.DocumentDirectoryPath}/${projectName}`);

export const basePath = `${RNFS.DocumentDirectoryPath}`;
export const storagePath = `${basePath}/storage`;

export async function loadFile(name){
    return await RNFS.readFile(`${storagePath}/${name}`, 'utf8');
    
}
export async function loadYaml(name){
    const fileData = await loadFile(name);
    return yaml.safeLoad(fileData);
}

export async function getFiles({onProgress=function(){}}={}){
    let cache;
    let data = {};
    let errors = [];
    let filelist = [
        `${storagePath}/cache.json`,
        `${storagePath}/data.json`
    ];
    const db = firebase.firestore();
    const projectRef = db.collection("applications").doc(projectName);
    const collectionsRef = projectRef.collection("projects");
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const mainFolderRef = storageRef.child(projectName);
    try{
        cache = await RNFS.readFile(`${storagePath}/cache.json`).then(json => JSON.parse(json));
    }catch(e){
        if(e.code === "ENOENT"){
            cache = {};
        }else{
            throw e;
        }
    }
    onProgress(` Downloading applications/${projectName}`);
    const projectsSnapshot = await collectionsRef.get();
    const projects = projectsSnapshot.docs;
    for (let s of projects){
        const d = data[s.id] = s.data();
        for(let key in d){
            if(d[key].indexOf("gs://") == 0){
                const filename =  d[key].split("/").slice(-1)[0];
                const dest = `${storagePath}/${s.id}/${filename}`;
                onProgress(`Downloading ${s.id}/${filename}`);
                try{
                    await storage.refFromURL(d[key]).downloadFile(dest);
                }catch(e){
                    errors.push(e);
                }
                if(key == "ref"){
                    // Will be deleted by cleanup()
                    try{
                        const fileData = await loadYaml(`${s.id}/${filename}`);
                        console.warn("ref data : ", fileData);
                        for(let key in fileData){
                            console.log("set key", key.toLowerCase().replace(/\s/,"_"));
                            d[key.toLowerCase().replace(/\s/,"_")] = fileData[key];
                            delete d["ref"];
                        }
                    }catch(e){
                        errors.push(e);
                    }
                   
                }else{
                    d[key] = dest;
                    filelist.push(dest);
                }
            }
        }
    }
    //Cleanup
    onProgress("Cleaning Up")
    await cleanup(storagePath, filelist);
    await RNFS.writeFile(`${storagePath}/data.json`, JSON.stringify(data), 'utf8');
    return {data, errors};
}
async function cleanup(dir, keep=[]){
    const localFiles = await RNFS.readDir(dir);
    for(let file of localFiles){ 
        if(file.isDirectory()){
            if(keep.filter(path => file.path.indexOf(path) == -1).length == 0){
                console.warn("Removing folder : ", file.path);
            }else{
                await cleanup(file.path, keep);
            }
        }else if(keep.indexOf(file.path) == -1){
            console.warn("cleanup : ", file.path);
        }
    }
}