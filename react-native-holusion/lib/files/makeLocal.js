
import RNFS from "react-native-fs";
import storage from "@react-native-firebase/storage";

import {getCachedHash} from "./cache";
import {mediasPath} from "./path";
import {FileError} from "./readWrite";  

export async function makeLocal(d, { onProgress = function () { }, force = false, signal } = {}) {
  let filelist = {};
  let errors = [];
  const isCancelled = ()=> signal && signal.aborted;
  for (let key in d) {
    if (isCancelled()) break;
    if (typeof d[key] === "string" && d[key].indexOf("gs://") == 0 && !d[key].endsWith("/") && key !== 'repo') {
      const ref = storage().refFromURL(d[key]);
      const name = ref.name;
      const dest = `${mediasPath()}/${name}`;
      
      onProgress(`Checking out ${name}`);
      let [
        exists,
        localHash,
        {md5Hash} /* Base64 encoded hash */
      ] = await Promise.all([
        RNFS.exists(dest),
        ((filelist[dest])? Promise.resolve(filelist[dest]) : getCachedHash(dest)),
        ref.getMetadata()
      ].map(p => p.catch((e)=> {
        console.warn(`Failed to get hash for ${name} : `, e);
        return false
      })));
      if (isCancelled()) break;

      if ( !(exists && md5Hash && localHash === md5Hash) ) {
        onProgress(`Downloading ${ref.fullPath} from ${ref.bucket.name}`);
        try {
          await ref.writeToFile(dest);
          filelist[dest] = md5Hash || true; // true means should be kept but will always be updated    
        } catch (e) {
          if (e.code == "storage/object-not-found") {
            errors.push(new FileError(name, `${name} could not be found at ${d[key]}`, e.code));
          } else {
            errors.push(new FileError(name, `${e.code} - ${e.message}`, e.code));
          }
        }
      } else {
        onProgress(`${name} is up to date`);
        filelist[dest] = md5Hash || true; // true means should be kept but will always be updated  
      }

      d[key] = `file://${dest}`;

    } else if (typeof d[key] === "object") {
      const [new_errors, new_filelist] = await makeLocal(d[key]);
      errors = errors.concat(new_errors);
      filelist = Object.assign(filelist, new_filelist);
    }
  }
  return [errors, filelist];
}