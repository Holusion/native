import {join} from "path";
import fs from "filesystem";
let _basePath;
export const setBasePath = (p )=>{ 
  if(typeof p !== "string") throw new Error(`path must be a string. got ${typeof p} (in "setBasePath")`);
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
  return path.split("/").slice(-1)[0];
}