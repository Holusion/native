
import {promises as fs, constants} from "fs";
import {dirname, basename} from "path";

export default {
  readdir: (path)=>fs.readdir(path, {withFileTypes: true}),
  rmdir: (path)=>fs.rmdir(path,{recursive: true}),
  unlink: fs.unlink,
  exists: (path)=>fs.access(path,  constants.R_OK).then(()=> true).catch(()=>false),
  mkdir: (path)=> fs.mkdir(path, {recursive:true}),
  readFile: fs.readFile,
  writeFile: fs.writeFile,
  atomicWrite: async (path, str)=>{
    const dir = dirname(path);
    const name = basename(path);
    await fs.writeFile(`${dir}/~${name}`, str, 'utf8');
    await fs.rename(`${dir}/~${name}`, `${dir}/${name}`);
  },
  rename: fs.rename,
}