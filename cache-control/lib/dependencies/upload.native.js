'use strict';
import Upload from 'react-native-background-upload'
import {AbortError, FileError, HTTPError} from "../errors";

/**
 * 
 * @param {string} file 
 */
function getMime(file){
  file = file.toLowerCase();
  if(file.endsWith(".mp4")) return "video/mp4";
  if(file.endsWith(".mov")) return "video/quicktime";
  if(file.endsWith(".wmv")) return "video/x-ms-wmv";
  if(file.endsWith(".flv")) return "video/x-flv";
  if(file.endsWith(".png")) return "image/png";
  if(file.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}
/**
 * @param {object} p
 * @param {AbortSignal} [p.signal]
 * @param {string} p.url
 * @param {"raw"|"multipart"} p.type 
 * @param {{uri:string, name: string, hash?:string}} p.file
 * @return {Promise<void>}
 */
async function post({url, type, file, signal}){
  let pathname = type === "raw" ? `${url}/medias/${encodeURIComponent(file.name)}`:`${url}/medias`;
  let id = await Upload.startUpload({
    url: pathname,
    path: encodeURI(file.uri),
    method: 'POST',
    type,
    field: (type === "raw")? undefined : "files",
    headers: {
      "Accept": "application/json",
      "Content-Type": type==="raw"?getMime(file.name):"multipart/form-data"
    }
  });
  let cancelFn = ()=>{
    Upload.cancelUpload(id);
  };
  signal?.addEventListener("abort", cancelFn);
  let res = await new Promise((resolve, reject)=>{
    let subs = [];
    function complete(err, res){
      subs.forEach(sub=>sub.remove());
      if(err) reject(err);
      else resolve(res);
    }
    subs.push(Upload.addListener("error", id, (err)=>complete(err)));
    subs.push(Upload.addListener("cancelled", id, ()=>complete(new AbortError("Upload was aborted"))));
    subs.push(Upload.addListener("completed", id, (res)=>complete(null, res)));
    let progress =0;
    subs.push(Upload.addListener("progress", id, (p)=>{
      if(progress+10 < p.progress){
        progress = Math.floor(p.progress);
        console.log("Progress : %d%", progress);
      }
    }));
  });
  signal?.removeEventListener("abort", cancelFn);
  if(res.responseCode !== 200){
    let body;
    try{
      body = JSON.parse(res.responseBody);
    }catch(e){
      body = res.responseBody;
    }
    let msg;
    if(body && body.message) msg = ((typeof body.message == 'object') ? JSON.stringify(body.message) : body.message)
    else msg = `Upload failed (${res.responseCode}) : ${res.responseBody}`
    throw new HTTPError(res.responseCode, msg);
  }
}

/**
 * uses `uploadFiles()` from react-native-fs because the `fetch()` polyfill tends to use a lot of RAM.
 * @param {string} url - target url (eg. http://192.168.1.10) 
 * @param {object} file - a file reference
 * @param {string} file.uri - path to file on local filesystem
 * @param {string} file.name - the file's name that will be used as identifier in playlist
 * @param {string} [file.hash] - file's hash
 * @param {AbortSignal} [signal] - an AbortController's signal to give to fetch() 
 */
export async function uploadFile(url, file, signal) {
  try {
    try{
      await post({url, type: "raw", file, signal});
    }catch(e){
      if(e.name === "AbortError") throw e;
      else if(e.code === 404) console.warn("Raw upload not supported on this product");
      else console.log("Failed to upload raw :", e);
      await post({url, type: "multipart", file, signal});
    }

    if (file.hash) {
      let response = await fetch(`${url}/playlist`, {
        method: "PUT",
        signal: signal,
        headers: {
          'Accept': 'application/json',
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: { name: file.name },
          modifier: {
            $set: {
              conf: { hash: file.hash }
            }
          },
        })
      });
      if (!response.ok) {
        let body;
        try{
          body = await response.json();
        }catch(e){
          //Error is always Invalid JSON
          body = {};
        }
        if (body.message) {
          throw new Error((typeof body.message == 'object') ? JSON.stringify(body.message) : body.message);
        } else {
          throw new Error(`Failed to get ${url}/playlist : ${response.statusText}`);
        }
      }
    }
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new FileError(file.uri, e);
  }
}