
import RNFS from "react-native-fs";

async function readWithFallback(path ){
  let txt;
  try{
    txt = await RNFS.readFile(path);
  }catch(e){
    if(e.code !== 'ENOENT') throw e;
    try{
      txt = await RNFS.readFile(path+'~');
    }catch(err){
      throw e;
    }
  }
  return txt;
}

//RNFS does not provide any atomic write capabilities so we must make a three-way replace
async function atomicWrite(path, data){
  const segments = path.split("/");
  const name = segments.pop();
  const dir = segments.join("/");
  const tmpFile = `${dir}/~${name}`
  const fallback = path+'~';
  await RNFS.writeFile(tmpFile, data);
  try{
    await RNFS.unlink(fallback);
  }catch(e){
    console.warn("unlink error : ",e);
    if(e.code !=="ENOENT") throw e;
  }
  try{
    await RNFS.moveFile(path, fallback);
  }catch(e){
    console.warn("Move error : ",e);
    if(e.code !=="ENOENT") throw e;
  }
  await RNFS.moveFile(tmpFile, path);
}

export default {
  readdir: (path)=>RNFS.readDir(path),
  rmdir: (path)=>RNFS.unlink(path),
  unlink: RNFS.unlink,
  exists: RNFS.exists,
  mkdir: (path)=> RNFS.mkdir(path),
  readFile: readWithFallback,
  writeFile: RNFS.writeFile,
  atomicWrite,
  rename: RNFS.moveFile,
}