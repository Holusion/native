import {firebase} from "firebase";
import {mediasPath} from "../path";

import {parseLink} from "./filerefs";


export function _makeLocal(projectName, d) {
  let filelist = new Set();
  let res = Array.isArray(d)? []: {};

  const storage = firebase.app().storage();
  for (let key in d) {
    if (typeof d[key] === "string" && /^(?:gs:)?\/\//.test(d[key]) && !d[key].endsWith("/") && key !== 'repo') {
      const [src, dest] = parseLink(d[key].replace(/^\/\//, ""), projectName);
      res[key] = dest;
      filelist.add(src);
    } else if (typeof d[key] === "object") {
      let [internal_res, other_files] = _makeLocal(projectName, d[key]);
      res[key]= internal_res;
      filelist = new Set([...filelist, ...other_files]);
    }else{
      res[key] = d[key];
    }
  }
  
  return [res, filelist];
}

/**
 * @type {import(".").TransformFactory}
 */
export function makeLocalFactory(projectName){
  return _makeLocal.bind(null, projectName);
}