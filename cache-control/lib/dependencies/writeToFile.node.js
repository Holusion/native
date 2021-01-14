import https from "https";
import {promises as fs, createWriteStream} from "fs";

import {basename, join, dirname} from "path";
import {firebase} from "@firebase/app";
import "@firebase/storage";


import {FileError} from "../errors";

export function fetchFile(src, {dest,signal={}}={}){
  if(/^file:\/\//.test(dest)){
    dest = dest.slice(7);
  }
  const tmp_dest = join(dirname(dest), `~${basename(dest)}`);
  const f = createWriteStream(tmp_dest);
  f.on("error", (e)=> console.warn("WriteStream internal error : ", e));
  return new Promise((resolve, reject)=>{
    https.get(src, function(response){
      response.on("error",(e)=>{
        console.warn("Response error");
        f.close();
        fs.unlink(tmp_dest)
        .catch(()=>{})
        .finally(()=>reject(e))
      });

      response.on("data", (d)=>{
        if(signal.aborted){
            response.abort(); //socket will emit an error
        }else{
            f.write(d);
        }
      });

      response.on("end",()=>{
        f.close();
        if(!signal.aborted){
            fs.rename(tmp_dest, dest)
            .then(()=>resolve(dest));
        }
      });
    });
  });
}



export default async function writeToFile(src, dest){
  const ref = firebase.storage().refFromURL(src);
  const fullPath = ref.fullPath;
  const name = basename(fullPath);
  try{
    const src = await ref.getDownloadURL();
    await fetchFile(src, { dest });
  }catch(e){
    console.warn("Download error on %s : ", fullPath, e.message);
    if(e.code == "storage/object-not-found"){
      throw new FileError(name, `${name} could not be found at ${ref.fullPath}`)
    }else{
      throw new FileError(name, e);
    }
  }
}