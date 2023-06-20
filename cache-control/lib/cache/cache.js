
import AsyncLock from 'async-lock';
import {join} from "filepaths";

import {storagePath} from "../path";
import {loadFile, saveFile} from "../readWrite";

const lock = new AsyncLock({ });



export const localFiles = ()=> new Map([
  join(storagePath(), `cache.json`),
  join(storagePath(), `data.json`),
  join(storagePath(), `conf.json`),
].map(f => ([f, true])));


async function _getCache(){
  let content = "{}";
  try{
    content = await loadFile("cache.json");
  }catch(e){
    if(e.code !== "ENOENT"){
      throw e;
    }
  }
  return JSON.parse(content);
}
/**
 * @returns {Promise<object>} - a key-value store of all cached files "zones"
 */
export async function getCache(){
  return await lock.acquire("cache-file", async ()=>{
    return await _getCache();
  })
}
/**
 * 
 * @param {string} name 
 * @param {object} files - a <path>: <hash> store of cached files for this name
 */
export async function saveCache(files){
  return await lock.acquire("cache-file", async()=>{
    let cache = await _getCache();
    let mergedCache = Object.assign({}, cache, files);
    //console.warn("Save cache data : ",cache, mergedCache);
    await saveFile("cache.json", JSON.stringify(mergedCache, null, 2));
  });
}
/**
 * Return a map of cache files
 * @returns {Promise<Map<string, string>>} - all cached files by paths with their hashes
 */
export async function getCacheFiles(){
  let flatList = localFiles();
  let cache = await getCache();
  for (let file in cache){
    flatList.set(file, cache[file]);
  }
  return flatList;
}
/**
 * 
 * @param {string} file - path to a file
 * @returns {Promise<string|true >} - a base64 hash, undefined for files that doesn't exists 
 */
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
