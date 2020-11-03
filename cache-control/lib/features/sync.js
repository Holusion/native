import {call, cancelled, put, select} from "redux-saga/effects";
import {CANCEL} from '@redux-saga/symbols'
import { getConfig, getItems, getItemsArray } from "./data";

import { getHash, getUncachedFiles } from "./files";
import { getActiveProduct } from "./products";
import { setSynchronized } from "./status";
import { uploadFile } from "../upload";
import { getConf } from "./conf";
import { error, info, warn } from "./logs";
import { filename } from "../path";


const abortableFetch = (url, opts) => {
  const controller = new AbortController();
  const signal = controller.signal;
  const promise = fetch(url, {
      ...opts,
      signal,
  })
  promise[CANCEL] = () => controller.abort()
  return promise
}

const abortableUpload = (url, file) =>{
  const controller = new AbortController();
  const signal = controller.signal;
  const promise = uploadFile(
    url, 
    file,
    signal,
  )
  promise[CANCEL] = () => controller.abort()
  return promise
}

export function* synchronizeProduct(){
  yield put(setSynchronized(false));
  const target = yield select(getActiveProduct);
  const uncachedFiles = yield select(getUncachedFiles);
  if(!target || uncachedFiles.length !== 0){
    return;
  }

  let hasError = false, count= 0;

  const abortController = new AbortController();
  const url = `http://${target.url}`;

  const {purge: doPurge} = yield select(getConf);
  const items = yield select(getItemsArray);
  const {video, categories=[]} = yield select(getConfig);
  
  const videos = new Set([
      ...items.map(i=>i.video),
      video,
      ...categories.map(c=>c.video)
  ].filter(i=>i));
  
  try{
    const res = yield call(abortableFetch, `${url}/playlist`, {
      method: "GET",
    });
    const playlist = yield call([res, res.json]);
    if(!res.ok){
      let err = new Error(`Failed to fetch playlist (${res.statusCode})`);
      err.context = playlist.message;
      throw err;
    }else{
      yield put(info("SYNC", `${playlist.length} vidéos trouvées sur ${target.name}`));
    }
    for (let video of videos){
      const hash = yield select(getHash, video);
      const name = filename(video);
      const dist = playlist.find(i=>i.name === name);
      try{
        if(dist && dist.conf && dist.conf.hash && dist.conf.hash === hash){
          continue;
        }
        
        if(dist){
          yield put(info("SYNC", "Suppression de la vidéo dupliquée "+name));
          yield call(abortableFetch, `${url}/medias/${name}`, { method: "DELETE" });
        }
        yield call(abortableUpload, url, {
          uri: video,
          name,
          hash,
        })
        count++;
      }catch(e){
        hasError = true;
        let wrap = new Error(`Failed to upload ${name}`);
        wrap.context = e.message+ "\n"+ e.stack;
        yield put(setSynchronized(wrap));
      }
    }
  }catch(e){
    hasError = true;
    let wrap = new Error(`Echec de l'envoi des vidéos au produit`);
    wrap.context = e.toString();
    yield put(setSynchronized(wrap));
  }
  if(!hasError && 0< count){
    yield put(info("SYNC", `${target.name} synchronisé`, `${count} vidéo${1< count?"s":""} synchronisée${1 < count?"s":""} sur ${target.name}`));
  }else if(!hasError){
    yield put(info("SYNC", `${target.name} synchronisé`, `${target.name} possédait déjà toutes les vidéos`));
  }

  if (doPurge === true) {
    const unused_items = playlist.filter((i) => {
      return videos.findIndex(v => filename(v) === i.name) === -1;
    })
    for (let item of unused_items) {
      try {
        yield call(abortableFetch, `${url}/medias/${item.name}`, { method: "DELETE"});
      } catch (e) {

        yield put(error("SYNC", `Echec de la suppression de ${item.name}`));
      }
    }
    let s = 1 < unused_items.length ? "s" : ""
    yield put (info("SYNC",`${unused_items.length} ancienne${s} vidéo${s} supprimée${s}`));
  }
  if(!hasError){
    yield put(setSynchronized(true));
  }
}
