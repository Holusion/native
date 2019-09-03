'use strict';
import firebase from "react-native-firebase";
import RNFS from 'react-native-fs';
import yaml from 'js-yaml';

import {base64ToHex} from "./convert";

import {name as projectName} from "../../package.json"
//let files = await RNFS.readDir(`${RNFS.DocumentDirectoryPath}/${projectName}`);

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

export async function getFiles({onProgress=function(){}, force=false}={}){
    let cache;
    let data = {};
    let errors = [];
    let filelist = [
        `${storagePath}/data.json`
    ];
    const db = firebase.firestore();
    const projectRef = db.collection("applications").doc(projectName);
    const collectionsRef = projectRef.collection("projects");
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const mainFolderRef = storageRef.child(projectName);

    onProgress(` Downloading applications/${projectName}`);
    const configSnapshot = await projectRef.get();
    const config = configSnapshot.exists ? configSnapshot.data():{};

    const [new_errors, new_files] = await makeLocal(config, {onProgress, force});
    errors = errors.concat(new_errors);
    filelist = filelist.concat(new_files);

    const projectsSnapshot = await collectionsRef.get();
    const projects = projectsSnapshot.docs;
    for (let s of projects){
        const d = data[s.id] = s.data();
        const [new_errors, new_files] = await makeLocal(d, {onProgress, force});
        errors = errors.concat(new_errors);
        filelist = filelist.concat(new_files);
    }
    //Cleanup
    onProgress("Cleaning Up");
    await cleanup(storagePath, filelist);
    console.warn("Stringified store : ", JSON.stringify({items: data, config: config}))
    await Promise.all([
        RNFS.writeFile(`${storagePath}/data.json`, JSON.stringify({items: data, config: config}), 'utf8'),
    ]);
    return {data, config, errors};
}

async function makeLocal(d, {onProgress, force}){
    const filelist = [];
    const errors = [];
    const storage = firebase.storage();
    for(let key in d){
        if(d[key].indexOf("gs://") == 0){
            const ref = storage.refFromURL(d[key]);
            const fullPath = ref.fullPath.slice(10); //fullPath starts with : 'url::gs://'
            const name = filename(fullPath);
            const dest = `${storagePath}/${fullPath}`;
            onProgress(`Checking out ${fullPath}`);
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
                    errors.push(e);
                }
            }else{
                onProgress(`${name} is up to date`);
                await delay(20);
            }
            filelist.push(dest);
            
            if(key == "ref"){
                // Will be deleted by cleanup()
                try{
                    const fileData = await loadYaml(`${fullPath}`);
                    for(let key in fileData){
                        d[key.toLowerCase().replace(/\s/,"_")] = fileData[key];
                    }
                }catch(e){
                    errors.push(e);
                }
               
            }else{
                d[key] = `file://${dest}`;
            }
        }
    }
    return [errors, filelist];
}

async function cleanup(dir, keep=[]){
    const localFiles = await RNFS.readDir(dir);
    for(let file of localFiles){ 
        if(file.isDirectory()){
            if(keep.filter(path => file.path.indexOf(path) == -1).length == 0){
                console.warn("Removing folder : ", file.path);
                await RNFS.unlink(file.path);
            }else{
                await cleanup(file.path, keep);
            }
        } else if(keep.indexOf(file.path) == -1){
            console.warn("cleanup : ", file.path);
            await RNFS.unlink(file.path);
        }
    }
}
