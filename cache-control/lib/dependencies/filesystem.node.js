
import {promises as fs, constants} from "fs";
import {dirname, basename, join} from "path";

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
    await fs.writeFile(join(dir, `~${name}`), str, 'utf8');
    await fs.rename(join(dir, `~${name}`), join(dir, name));
  },
  stat: fs.stat,
  rename: fs.rename,
}