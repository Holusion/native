import fs from "filesystem";
import {firebase} from "firebase";
import {makeLocal} from "./makeLocal";

import {CacheStage, getCachedHash} from "./cache";
import writeToFile from "writeToFile";


export async function transformSnapshot(transforms, snapshot){
  let res = Object.assign(snapshot.exists? snapshot.data(): {}, {id: snapshot.id});
  let files = new Map();

  for(let t of transforms){
    let [tr_res, new_files ] = await t(res);
    res = tr_res;
    files = new Map([...files, ...new_files]);
  }
  return [res, files];
}



export function watchFiles({
  projectName,
  dispatch,
  transforms = [makeLocal],
  onProgress = function () { },
  onUpdate = function () { },
} = {}) {
  if (!projectName) {
    throw new Error(`A valid projectName is required. Got ${projectName}`);
  }
  let unsubscribes = [];
  let abortConfig, abortProject;

  const db = firebase.app().firestore();

  const projectRef = db.collection("applications").doc(projectName);
  const collectionsRef = projectRef.collection("pages");


  unsubscribes.push(projectRef.onSnapshot(
    (configSnapshot) => {
      if (abortConfig) abortConfig.abort(); //Cancel any previous run
      abortConfig = new AbortController();
      onUpdate("config");
      onConfigSnapshot(transformSnapshot(transforms, configSnapshot), { signal: abortConfig.signal, onProgress, projectRef, dispatch })

    },
    (e) => onProgress("Can't get project snapshot for " + projectRef.path + " :", e.message)
  ))

  unsubscribes.push(collectionsRef.onSnapshot(
    (projectsSnapshot) => {
      if (abortProject) abortProject.abort();
      abortProject = new AbortController();
      onUpdate("items");
      onProjectSnapshot(Promise.all(projectsSnapshot.docs.map(ps => transformSnapshot(transforms, ps))), { signal: abortProject.signal, onProgress, projectRef, dispatch });
    },
    (e) => onProgress("Can't get collections snapshot for " + collectionsRef.path + " :", e.message)
  ));
  return () => {
    unsubscribes.forEach(fn => fn());
  }
}


export async function onConfigSnapshot(tr, { signal, onProgress=console.log, dispatch }) {
  let cache = new CacheStage("config");
  let [config, files] = await tr;
  let requiredFiles = [];


  try {
    for (let [dest, {src, hash}] of files.entries()){
      const name = dest.split("/").slice(-1)[0];
      const [localExists, localHash] = await Promise.all([
        fs.exists(dest),
        getCachedHash(dest)
      ]);
      if(!(localExists && localHash && localHash === hash)){
        if(!localExists) console.info(`${dest} doesn't exists`);
        else if(!localHash) console.info(`no cached hash for ${dest}`)
        else console.info(`local hash for ${name} is ${localHash}. remote is ${hash}`);
        requiredFiles.push([src, dest]);
      }else{
        //console.info(`cache for ${name} is up to date`);
      }
    }
    const cacheFiles = Array.from(files.entries()).reduce((res,[dest, { hash }])=> {
      res[dest] = hash;
      return res;
    }, {});
    await cache.batch(cacheFiles);

    for(let index=0; index < requiredFiles.length; index++){
      let [src, dest] = requiredFiles[index];
      onProgress(`GET ${src.split("/").slice(-1)[0]} (${index+1}/${requiredFiles.length})`);
      await writeToFile(src, dest);
      if (signal && signal.aborted) return;
    }
  } catch (e) {
    return onProgress("Failed to fetch config resources : "+ e.message);
  }
  if (signal && signal.aborted) return //Don't do nothing on abort
  
  config.categories = (Array.isArray(config.categories)) ? config.categories.map(c => {
    return (typeof c === "string") ? { name: c } : c;
  }) : [];

  await cache.close()
  .catch((e)=>{
    onProgress(`Failed to save cache file : ${e.message}`);
  });

  dispatch({ config });
  onProgress("Updated configuration");
}

async function onProjectSnapshot(projects, { signal, onProgress, projectRef, dispatch }) {
  projects = await projects;
  const items = {};
  let cache = new CacheStage("items");
  if (projects.length == 0) {
    throw new Error(`no project found in ${projectRef.id}`);
  }

  let requiredFiles = [];
  for (let [d] of projects) {
    if (d.active === false) continue;
    items[d.id] = d;
  }

  let files = projects.reduce((prev, [, files])=> new Map([...prev, ...files]), new Map());
  for (let [dest, {src, hash}] of files.entries()){
    console.log()
    const name = dest.split("/").slice(-1)[0];
    const [localExists, localHash] = await Promise.all([
      fs.exists(dest),
      getCachedHash(dest)
    ]);
    if(!(localExists && localHash && localHash === hash)){
      requiredFiles.push([src, dest]);
    }else{
      //console.info(`cache for ${name} is up to date`);
    }
  }
  await cache.batch(Array.from(files.entries()).reduce((res,[dest, {hash}])=> {
    res[dest] = hash;
    return res;
  }, {}));

  for(let index=0; index < requiredFiles.length; index++){
    let [src, dest] = requiredFiles[index];
    onProgress(`Downloading ${src.split("/").slice(-1)[0]} (${index+1}/${requiredFiles.length})`);
    await writeToFile(src, dest);
    if (signal && signal.aborted) return;
  }

  await cache.close()
  .catch((e)=>{
    onProgress(`Failed to save cache file : ${e.message}`);
  })

  dispatch({ items });
  onProgress("Updated item collections");
}
