import {hostname} from "os";
import {basename} from "path"
import {readFile} from "fs/promises";

export const getUniqueId = async ()=>{
  let id = await readFile("/etc/machine-id", {encoding:"utf-8"})
  return Buffer.from(id, "hex").toString("base64url");
};

export const getDeviceName = ()=>Promise.resolve(hostname());

export const getApplicationName = ()=> basename(process.title);
