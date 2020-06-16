
import fs from "filesystem";

import {storagePath, mediasPath} from "./path";
import {loadFile, lock, FileError, saveFile} from "./readWrite";


export const localFiles = ()=> new Map([
  `${storagePath()}/cache.json`, 
  `${storagePath()}/data.json`,
  `${storagePath()}/conf.json`,
].map(f => ([f, true])));

//Return a map of cache files
export async function getCacheFiles(){
  return await lock.acquire("cache-file", async ()=>{
    let flatList = localFiles();
    let content = "{}";
    try{
      content = await loadFile("cache.json");
    }catch(e){
      if(e.code !== "ENOENT"){
        throw e;
      }
    }
    let cache = JSON.parse(content);
    for (let zone in cache){
      for (let file in cache[zone]){
        flatList.set(file, cache[zone][file]);
      }
    }
    return flatList;
  })
}

export async function getCachedHash(file){
  let cacheFiles;
  try{
    cacheFiles  = await getCacheFiles();
  }catch(e){
    console.warn("Failed to get cached files list : ", e);
    cacheFiles = localFiles();
  }

  return cacheFiles.get(file);
}

//Low level cache merge
export async function saveCacheFile(key, data) {
  return await lock.acquire("cache-file", async ()=>{
    let cache;
    try{
      cache = JSON.parse(await loadFile("cache.json"));
    } catch(e){
      throw new FileError(`${storagePath()}/cache.json`, e.message, e.code);
    }
    let mergedCache = Object.assign({}, cache, {[key]: data});

    console.warn("Save cache data : ",cache, mergedCache);
    await saveFile("cache.json", JSON.stringify(mergedCache));
  })
}
export class CacheStage{
  constructor(name){
    this.name = name;
    this._id = `${name}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}`;
    this.files = {};
    this._closed = false;
  }

  get id(){ return this._id};

  static async load(){
    let content;
    try{
      return JSON.parse(await loadFile("cache.json"));
    } catch(e){
      if(e.code !== "ENOENT"){
        console.warn(new FileError(`${storagePath()}/cache.json`, e.message, e.code));
      }
      return {}
    }
  }

  /* returns a promise that resolves once cache is saved */
  async set(file, hash= true){
    return await this.batch({[file]: hash})
  }
  async batch(b){
    if(this.closed) throw new Error("can not append files to cache after staging area has been closed");
    return await lock.acquire("cache-file", async ()=>{
      Object.assign(this.files, b);
      let cache = await CacheStage.load();
      let mergedCache = Object.assign({}, cache, {[this.id]: this.files});
      //console.warn("Save cache data : ",cache, mergedCache);
      await saveFile("cache.json", JSON.stringify(mergedCache, null, 2));
    })
  }
  async close(){
    return await lock.acquire("cache-file", async () => {
      let cache = await CacheStage.load();
      let stages = [], otherZones = {};
      for (let zone in cache){
        if(zone.startsWith(`${this.name}.`)){
          stages.push(cache[zone]);
        }else{
          otherZones[zone] = cache[zone];
        }
      }
      let files = stages.sort().reduce((res, keyFiles)=>{
        return Object.assign(res, keyFiles);
      }, {});
      //console.info("Closed cache file : ", JSON.stringify(Object.assign(otherZones, {[this.name]: files }), null, 2));
      await saveFile("cache.json", JSON.stringify(Object.assign(otherZones, {[this.name]: files }), null, 2));
    })
  }

  static async closeAll(){
    return await lock.acquire("cache-file", async ()=>{
      let cache = await CacheStage.load();
      let stages = {}, otherZones = {};
      for (let zone in cache){
        let m = /^(\w+)\.[0-9a-z]+\.[0-9a-z]*$/i.exec(zone);
        if(m){
          if(!Array.isArray(stages[m[1]])) stages[m[1]] = [cache[zone]];
          else stages[m[1]].push(cache[zone]);
        }else{
          otherZones[zone] = cache[zone];
        }
      }
      let closures = Object.keys(stages).reduce((res, key)=>{
        return Object.assign(res, {[key]: stages[key].sort().reduce((r, k)=> Object.assign(r, k), {})})
      }, {})
      await saveFile("cache.json", JSON.stringify(Object.assign(otherZones,  closures), null, 2));
    });
  }
}



async function doClean(dir, flatList){
  let localFiles, unlinked = [], kept = [];
  try {
    localFiles = await fs.readdir(dir);
  } catch (e) {
    let fe = new FileError(dir, e.message);
    fe.code = e.code;
    throw e;
  }
  for (let file of localFiles) {
    //console.log("Checking local file : ", file);
    if (file.isDirectory()) {
      if (flatList.filter(path => path.indexOf(file.path) === 0).length == 0) {
        //No file has this prefix
        await fs.rmdir(file.path); // unlike node's unlink, this works recursively
        unlinked.push(file.path);
      } else {
        let [other_unlinked, other_kept] = await doClean(file.path, flatList);
        unlinked.push(...other_unlinked);
        kept.push(...other_kept);
      }
    } else if (flatList.indexOf(file.path) == -1) {
      await fs.unlink(file.path);
      unlinked.push(file.path);
    }else{
      kept.push(file.path);
    }
  }
  return [unlinked, kept];
}

export async function cleanup(dir = mediasPath(), flatList) {
  return await lock.acquire("cleanup", async () => {
    await CacheStage.closeAll();
    const flatList = Array.from((await getCacheFiles()).keys());
    let res =  await doClean(dir, flatList);
    return res;
  });
}
