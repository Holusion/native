import fs from "filesystem";
import {join, basename, sep} from "filepaths";

let _basePath;
export const setBasePath = (p)=>{ 
  if(typeof p !== "string") throw new Error(`path must be a string. got ${typeof p} (in "setBasePath")`);
  if(p.length == 0 ) throw new Error(`path must not be an empty string`);
  if(p.lastIndexOf(sep) === p.length -1) p = p.slice(0, -1);
  _basePath = p;
};

const getSuffix = (p)=>{
  if(!_basePath) throw new Error("basePath is not set. Please call setBasePath first");
  return join(_basePath, p);
} 


export const storagePath = ()=> getSuffix("storage");
export const mediasPath = ()=>getSuffix("medias");

export const createStorage = ()=> Promise.all([
  fs.mkdir(storagePath()),
  fs.mkdir(mediasPath())
]);


export function filename(path) {
  if (typeof path !== "string") throw new Error(`path must be a string. Got ${typeof path}`);
  return basename(path);
}