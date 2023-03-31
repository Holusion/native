import fs from "fs/promises";
import os from "os";
import {version, name} from "../../package.json" 


export const getDeviceName = ()=>Promise.resolve(os.hostname());

export const getApplicationName = ()=> name;

export const getUniqueId = async ()=> {
  if (os.platform() != "linux") throw new Error("Getting machine-id is only supported on linux");
  return (await fs.readFile("/etc/machine-id", {encoding:"utf-8"})).replace(/\n/g, "");
};