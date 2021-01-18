import RNFS from "react-native-fs";
import {FileError, AbortError} from "../errors";
/**
 * @deprecated see universal "upload" module : RNFS.uploadFiles() doesn't seem to work better (or at all)
 * uses `uploadFiles()` from react-native-fs because the `fetch()` polyfill tends to use a lot of RAM.
 * @param {string} url - target url (eg. http://192.168.1.10) 
 * @param {object} file - a file reference
 * @param {string} file.uri - path to file on local filesystem
 * @param {string} file.name - the file's name that will be used as identifier in playlist
 * @param {string} [file.hash] - file's hash
 * @param {AbortSignal} [signal] - an AbortController's signal to give to fetch() 
 */
export async function uploadFile(url, file, signal) {
  let body;
  try {
    const {promise:result_p, jobId} = RNFS.uploadFiles({
      toUrl: `${url}/medias`,
      method: "POST",
      files: [{
        filename: file.name,
        filepath: file.uri
      }],
      headers: {
        'Accept': 'application/json',
      },
    })

    //This is some crazy-ass workflow but couldn't find a better way to set up cancellation
    let result, isPending = true;
    try{
      result = await Promise.race([
        result_p,
        new Promise((_, reject)=>{
          (function waitFor(){
            if(!isPending) return;
            else if(signal && signal.aborted) {
              RNFS.stopUpload(jobId);
              reject(new AbortError());
            }
            else if(signal) setTimeout(waitFor, 50);
          })()
        }),
      ]);
    }finally{
      isPending = false;
    }
    
    if(result.statusCode !== 200){
      try{
        body = JSON.parse(result.body);
      }catch(e){
        body = result.body;
      }
      let msg;
      if(body && body.message) msg = ((typeof body.message == 'object') ? JSON.stringify(body.message) : body.message)
      else msg = `Upload failed (${result.statusCode}) : ${body}`
      throw new FileError(file.uri, msg);
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
        try{
          body = await response.json();
        }catch(e){
          //Error is always Invalid JSON
          body = {};
        }
        if (body.message) {
          throw new FileError(file.uri, (typeof body.message == 'object') ? JSON.stringify(body.message) : body.message);
        } else {
          throw new FileError(file.uri, `Failed to get ${url}/playlist : ${response.statusText}`);
        }
      }
    }
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new FileError(file.uri, e.message);
  }
}