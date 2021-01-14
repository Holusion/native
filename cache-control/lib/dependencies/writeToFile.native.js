

import storage from "@react-native-firebase/storage";


import {FileError} from "../errors";
import {filename} from "../path";

export default async function writeToFile(src, dest){
  const ref = storage().refFromURL(src);
  const fullPath = ref.fullPath;
  const name = filename(fullPath);
  try{
    await ref.writeToFile(dest);
  }catch(e){
    console.warn("Download error on %s : ", fullPath, e.message);
    if(e.code == "storage/object-not-found"){
      throw new FileError(name, `${name} could not be found at ${ref.fullPath}`)
    }else{
      throw new FileError(name, e);
    }
  }
}