import { getMetadata } from "../transforms";

/**
 * 
 * @param {import("../transforms").Transform} transforms 
 * @param {object} snapshot 
 */
export async function transformSnapshot(transforms, snapshot){
  let res = Object.assign(snapshot.exists? snapshot.data(): {}, {id: snapshot.id});
  let files = new Set();
  for(let t of transforms){
    let [tr_res, new_files ] = await t(res);
    res = tr_res;
    files = new Set([...files, ...new_files]);
  }
  //Transform he list of gs:// URIs to FileRef objects
  let filesMap = new Map(await Promise.all(
    Array.from(files.values())
    .map(async(src)=>{
      console
      let [dest, ref] = await getMetadata(src);
      return [dest, ref];
    })
  ));
  return [res, filesMap];
}
