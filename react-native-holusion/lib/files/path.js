import RNFS from "react-native-fs";

export const storagePath = ()=>`${RNFS.DocumentDirectoryPath}`;
export const mediasPath = ()=>`${RNFS.DocumentDirectoryPath}/medias`;

export const createStorage = ()=> RNFS.mkdir(mediasPath());


export function filename(path) {
  if (typeof path !== "string") throw new Error(`path must be a string. Got ${typeof path}`);
  return path.split("/").slice(-1)[0];
}