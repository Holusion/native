import https from "https";
import {promises as fs} from "fs";

import {basename, join, dirname} from "path";
import firebase from "firebase/compat/app";
import 'firebase/compat/storage';

import {CANCEL} from '@redux-saga/symbols';

import {FileError} from "../errors";

function _fetch(src){
  return new Promise((resolve, reject)=>{
    https.get(src, resolve).on("error", reject);
  })
}


export async function fetchFile(src, {dest, signal={}}={}){
  if(/^file:\/\//.test(dest)){
    dest = dest.slice(7);
  }
  const tmp_dest = join(dirname(dest), `~${basename(dest)}`);

  const response = await _fetch(src);
  if(response.statusCode != 200){
    throw new Error(`Unsupported status code : ${response.statusCode}`);
  }

  try{
    const handle = await fs.open(tmp_dest, "w");
    try{
      if(signal.aborted) {
        response.destroy();
        return;
      }
      for await (let data of response){
        if(signal.aborted) {
          response.destroy();
          return;
        }
        await handle.write(data);
      }
    }finally{
      await handle.close();
    }
    if(signal.aborted) return;
    await fs.rename(tmp_dest, dest);
  }catch(e){
    await fs.rm(tmp_dest,{force: true}).catch(()=>{})
    throw e;
  }
}



export default function writeToFile(src, dest){
  const ref = firebase.storage().refFromURL(src);
  const fullPath = ref.fullPath;
  const name = basename(fullPath);
  const p = Promise.resolve();
  const signal = {aborted: false};
  p[CANCEL]= ()=>{
    signal.aborted = true;
  }

  p.then(async ()=>{
    try{
      const src = await ref.getDownloadURL();
      await fetchFile(src, { dest, signal });
    }catch(e){
      console.warn("Download error on %s : ", fullPath, e.message);
      if(e.code == "storage/object-not-found"){
        throw new FileError(name, `${name} could not be found at ${ref.fullPath}`)
      }else{
        throw new FileError(name, e);
      }
    }

  })
  return p;
}