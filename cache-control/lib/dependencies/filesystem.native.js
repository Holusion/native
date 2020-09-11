
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
    //ENOENT should be ignored
    if(e.code !=="ENOENT"){ 
      console.warn("unlink error : ",e);
      throw e;
    }
  }
  try{
    await RNFS.moveFile(path, fallback);
  }catch(e){
    //If path doesn't exist, we don't have a problem
    if(e.code !=="ENSCOCOAERRORDOMAIN4") { // NSFileNoSuchFileError = 4
      console.warn("Move error : ",e.code, e);
      throw e;
    }
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
  stat: RNFS.stat,
  rename: RNFS.moveFile,
}