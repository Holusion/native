import {firebase} from "firebase";



import {mediasPath} from "./path";

export async function makeLocal(d, { signal } = {}) {
  let filelist = new Map();
  let res = Array.isArray(d)? []: {};

  const storage = firebase.app().storage();
  const isCancelled = ()=> signal && signal.aborted;
  for (let key in d) {
    if (isCancelled()) break;
    if (typeof d[key] === "string" && d[key].indexOf("gs://") == 0 && !d[key].endsWith("/") && key !== 'repo') {
      const ref = storage.refFromURL(d[key]);
      const name = ref.name;
      const dest = `${mediasPath()}/${name}`;
      
      let {md5Hash} = await ref.getMetadata().catch(e=>{
        console.warn("for "+dest, e);
        return {md5Hash: true};
      });

      filelist.set(dest, {
        src: d[key],
        hash: md5Hash,
      })

      res[key] = `file://${dest}`;

    } else if (typeof d[key] === "object") {
      let [internal_res, other_files] = await makeLocal(d[key], {signal});
      res[key]= internal_res;
      filelist = new Map([...filelist, ...other_files]);
    }else{
      res[key] = d[key];
    }
  }
  
  return [res, filelist];
}