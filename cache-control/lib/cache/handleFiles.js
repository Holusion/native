import {EventEmitter} from "events";
import fs from "filesystem";
import {basename} from "filepaths";

import writeToFile from "writeToFile";

import {getCachedHash, saveCache} from "./cache";

/**
 * @typedef ProgressReport
 * @type {object}
 * @property {number} totalSize - total size of sync to dowload
 * @property {number} requiredSize - size of required files
 * @property {number} progress - number of bytes downloaded
 * @property {number} length - total number of files (cache + downloads)
 * @property {number} nbDone   - number of files already fetched
 * @property {boolean} blocking - whether required files are missing
 */

/**
 * Async generator function to fetch required files
 * Call with : for await (let progress of handleFiles(files)){ ... }
 * Cached files are searched on first call. It's the caller's responsibility to not keep handles to an old iterator
 * @param {Array<import("../WatchChanges").FileRef} files - an array of file dependencies 
 * @param {object} [opts] - function options
 * @param {writeToFile} [opts.write=writeToFile]
 * @param {sortFiles} [opts.sortFiles=sortFiles]
 * @yields {ProgressReport}
 */
export async function* handleFiles(files, {
  write:_write=writeToFile,
  sortFiles:_sort=sortFiles,
  save:_save=saveCache,
} = {}){
  const {required, cached, other} = await _sort(files);

  const requiredSize= required.reduce((size, f)=>size+f.size, 0);
  const otherSize = other.reduce((size, f)=>size+f.size, 0);

  let p = {
    totalSize: requiredSize + otherSize,
    requiredSize: requiredSize,
    progress: 0,
    length: cached.length + required.length + other.length,
    nbDone: cached.length,
    blocking: required.length !== 0,
  }
  let cacheList = cached.reduce((res, file)=>({...res, [file.dest]: file.hash}), {});
  if(p.nbDone == p.length) return;
  yield {...p};

  for(let list of [required, other]){
    for(let file of list){
      await _write(file.src, file.dest);
      cacheList[file.dest] = file.hash;
      await _save(cacheList);
      p.progress += file.size;
      p.nbDone++;
      if(p.requiredSize === p.progress){ 
        p.blocking = false;
      }
      yield {...p};
    }
  }
}

/**
 * Verify if a file exists and get it's hash from cache.
 * Should reconcile most cache corruption errors
 * @returns {string|null} a md5Hash base64-encoded
 */
export async function getHash(dest){
  const [localExists, localHash] = await Promise.all([
    fs.exists(dest),
    getCachedHash(dest)
  ]);
  if(!localExists) return null;
  if(!localHash) return null;
  return localHash;
}

/**
 * 
 * @param {Map<string, import("../WatchChanges").FileRef} files - a Map of files dependencies
 * @param {object} [opts]
 * @param {getHash} [opts.getHash] - a function matching getHash's signature
 * @returns {Promise}
 */
export async function sortFiles(files, {getHash:_getHash=getHash}={}){
  let required = [];
  let other = [];
  let cached = [];
  for (let [dest, file] of files){
    const {hash, size, contentType} = file;
    const name = basename(dest);
    const localHash = await _getHash(dest);
    if(!localHash || localHash !== hash){
      if(/^video\//.test(contentType)){
        other.push({dest, name, ...file});
      }else{
        required.push({dest, name, ...file});
      }
    }else{
      cached.push({dest, name, ...file});
    }
  }
  return {required, other, cached};
}