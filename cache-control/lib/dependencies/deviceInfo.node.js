import {hostname} from "os";
import {basename} from "path"
import {readFile} from "fs/promises";
import {promisify} from "util";
import {exec as execCb} from "child_process";
const exec = promisify(execCb);

export const getUniqueId = async ()=>{
  switch(process.platform){
    case "win32":
      return (await exec("wmic csproduct get uuid")).stdout.split("\n")[1];
    case "darwin":
      let out = (await exec("ioreg -d2 -c IOPlatformExpertDevice")).stdout;
      let m = /"IOPlatformUUID" ="([-a-fA-F0-9]+)$"/gm.exec(out);
      if(!m) throw new Error("Failed to get UUID : output does not match regex");
      return m[1];
    case "linux":
    default:
      let id = await readFile("/etc/machine-id", {encoding:"utf-8"})
      return Buffer.from(id, "hex").toString("base64url");
  }
};

export const getDeviceName = ()=>Promise.resolve(hostname());

export const getApplicationName = ()=> basename(process.title);
