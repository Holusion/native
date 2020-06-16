
import {promises as fs, constants} from "fs";


export default {
  readdir: (path)=>fs.readdir(path, {withFileTypes: true}),
  rmdir: (path)=>fs.rmdir(path,{recursive: true}),
  unlink: fs.unlink,
  exists: (path)=>fs.access(path,  constants.R_OK).then(()=> true).catch(()=>false),
  mkdir: (path)=> fs.mkdir(path, {recursive:true}),
  readFile: fs.readFile,
  writeFile: fs.writeFile,
}