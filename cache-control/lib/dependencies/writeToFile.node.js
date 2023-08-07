import https from "https";
import {promises as fs} from "fs";
import {once} from "events";

import {basename, join, dirname} from "path";
import firebase from "firebase/compat/app";
import 'firebase/compat/storage';

import {CANCEL} from '@redux-saga/symbols';

import {FileError} from "../errors";

let op_id = 0;

export async function fetchFile(src, {dest, signal={}}={}){
  if(/^file:\/\//.test(dest)){
    dest = dest.slice(7);
  }

  const tmp_dest = join(dirname(dest), `~${++op_id}-${basename(dest)}`);
  
  let request =  https.get(src);
  let [response] = await once(request, "response", {signal});

  if(response.statusCode == 301 || response.statusCode === 302){
    request =  https.get(response.headers["location"]);
    response.destroy();
    [response] = await once(request, "response", {signal});
  }

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
  const c = new AbortController();
  const p = Promise.resolve();
  p[CANCEL] = ()=>c.abort();
  return p.then(async ()=>{
    try{
      const src = await ref.getDownloadURL();
      await fetchFile(src, { dest, signal:c.signal });
    }catch(e){
      console.warn("Download error on %s : ", fullPath, e.message);
      if(e.code == "storage/object-not-found"){
        throw new FileError(name, `${name} could not be found at ${ref.fullPath}`)
      }else{
        throw new FileError(name, e);
      }
      
    }
  });

}