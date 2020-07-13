
import RNFS from "react-native-fs";


export default {
  readdir: (path)=>RNFS.readDir(path),
  rmdir: (path)=>RNFS.unlink(path),
  unlink: RNFS.unlink,
  exists: RNFS.exists,
  mkdir: (path)=> RNFS.mkdir(path),
  readFile: RNFS.readFile,
  writeFile: RNFS.writeFile,
  rename: RNFS.moveFile,
}