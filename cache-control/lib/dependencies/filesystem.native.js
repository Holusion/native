
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
  //We write to a tmp location to be able to atomic-move it.
  //console.log("atomic write to ", name);
  await RNFS.writeFile(tmpFile, data); 
  //Check if file does exist by trying to move tmp file to it
  try{
    await RNFS.moveFile(tmpFile, path);
    //If it worked, we're done.
    return;
  }catch(e){
    if(e.code !== "ENSCOCOAERRORDOMAIN516"){ //NSFileWriteFileExistsError
      console.log("initial moveFile error : ", e.code, e);
      throw e;
    }
  }
  //So we're here because the destination file exists and we wish to atomically replace it
  try{
    await RNFS.unlink(fallback); 
  }catch(e){
    //ENOENT should be ignored. Otherwise, it's an error
    if(e.code !=="ENOENT"){
      throw e;
    }
  }
  try{
    //console.log("Move ",path.split("/").slice(-1)[0], "to", fallback.split("/").slice(-1)[0]);
    await RNFS.moveFile(path, fallback);
  }catch(e){
    //If path doesn't exist, we don't have a problem
    if(e.code !=="ENSCOCOAERRORDOMAIN4") { // NSFileNoSuchFileError = 4
      //console.log("move fallback threw an error", e)
      throw e;
    }
  }
  //console.log("Move ",tmpFile.split("/").slice(-1)[0], "to", path.split("/").slice(-1)[0] );
  try{
    await RNFS.moveFile(tmpFile, path);
  }catch(e){
    //console.log("Move to path threw an error", e);
    throw e;
  }
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