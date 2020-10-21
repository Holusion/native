

export async function transformSnapshot(transforms, snapshot){
  let res = Object.assign(snapshot.exists? snapshot.data(): {}, {id: snapshot.id});
  let files = new Map();
  for(let t of transforms){
    let [tr_res, new_files ] = await t(res);
    res = tr_res;
    files = new Map([...files, ...new_files]);
  }
  return [res, files];
}
