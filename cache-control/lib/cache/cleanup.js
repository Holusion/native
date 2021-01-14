import fs from "filesystem";

import { mediasPath} from "../path";
import { FileError} from "../errors";

import {getCacheFiles} from "./cache";

import AsyncLock from 'async-lock';

const lock = new AsyncLock({ });

async function doClean(flatList, dir){
  let localFiles, unlinked = [], kept = [];
  try {
    localFiles = await fs.readdir(dir);
  } catch (e) {
    let fe = new FileError(dir, e.message);
    fe.code = e.code;
    throw e;
  }
  for (let file of localFiles) {
    const filepath = file.path? file.path : `${dir}/${file.name}`;
    //console.log("Checking local file : ", file);
    if (file.isDirectory()) {
      if (flatList.filter(path => path.indexOf(filepath) === 0).length == 0) {
        //No file has this prefix
        await fs.rmdir(filepath); // unlike node's unlink, this works recursively
        unlinked.push(filepath);
      } else {
        let [other_unlinked, other_kept] = await doClean(flatList, filepath);
        unlinked.push(...other_unlinked);
        kept.push(...other_kept);
      }
    } else if (flatList.indexOf(filepath) == -1) {
      await fs.unlink(filepath);
      unlinked.push(filepath);
    }else{
      kept.push(filepath);
    }
  }
  return [unlinked, kept];
}



/**
 * 
 * @param {Array<string>} files 
 * @param {*} dir 
 */
export async function cleanup(files, dir = mediasPath()) {
  return await lock.acquire("cleanup", async () => {
    let res =  await doClean(files, dir);
    return res;
  });
}