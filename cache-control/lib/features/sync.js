import {call, cancelled, put, select} from "redux-saga/effects";
import {CANCEL} from '@redux-saga/symbols';

import { uploadFile } from "../upload";

import { getConfig, getItemsArray } from "./data";

import { getHash, getUncachedFiles } from "./files";
import { getActiveProduct } from "./products";
import { setSynchronized } from "./status";
import { getConf } from "./conf";
import { error, info, warn } from "./logs";
import { filename } from "../path";


/* istanbul ignore next as described in https://github.com/redux-saga/redux-saga/issues/651 */
export const abortableFetch = (url, opts) => {
  const controller = new AbortController();
  const signal = controller.signal;
  const promise = fetch(url, {
      ...opts,
      signal,
  })
  promise[CANCEL] = () => controller.abort()
  return promise
}

/* istanbul ignore next same as abortableFetch, but uses the modified uploadFile method on native platforms */
export const abortableUpload = (url, file) =>{
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

export const newSet = (a)=> new Set(a);
export const getFilenames = (v)=> new Set(Array.from(v).map(v=>filename(v)));

export function* synchronizeProduct(){
  yield put(setSynchronized(false));
  const target = yield select(getActiveProduct);
  const uncachedFiles = yield select(getUncachedFiles);
  if(!target || uncachedFiles.length !== 0){
    return;
  }

  let hasError = false, count= 0, playlist;

  const url = `http://${target.url}`;

  const {purge: doPurge} = yield select(getConf);
  const items = yield select(getItemsArray);
  const {video, categories=[]} = yield select(getConfig);
  
  const videos = yield call(newSet, [
      ...items.map(i=>i.video),
      video,
      ...categories.map(c=>c.video)
  ].filter(i=>i));

  try{
    const res = yield call(abortableFetch, `${url}/playlist`, {
      method: "GET",
    });
    playlist = yield call([res, res.json]);
    if(!res.ok){
      let err = new Error(`Failed to fetch playlist (${playlist.message})`);
      throw err;
    }else{
      /* istanbul ignore next */
      const plural = 1 < playlist.length? "s":"";
      yield put(info("SYNC", `${playlist.length} vidéo${plural} trouvée${plural} sur ${target.name}`));
    }
  }catch(e){
    let wrap = new Error(`Echec de la récupération de la playlist`);
    wrap.context = `GET ${url}/playlist : ${e.message}`;
    yield put(setSynchronized(wrap));
    return; //There is no point in trying to do more
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
  
  if(!hasError && 0 < count){
    /* istanbul ignore next */
    let plural = 1 < count? "s":"";
    yield put(info("SYNC", `${target.name} synchronisé`, `${count} vidéo${plural} synchronisée${plural} sur ${target.name}`));
  }else if(!hasError){
    yield put(info("SYNC", `${target.name} synchronisé`, `${target.name} possédait déjà toutes les vidéos`));
  }

  if (doPurge === true) {
    const videoNames = yield call(getFilenames, videos);
    const unused_items = playlist.filter((i) => {
      return !videoNames.has(i.name);
    })
    for (let item of unused_items) {
      try {
        yield call(abortableFetch, `${url}/medias/${item.name}`, { method: "DELETE"});
      } catch (e) {
        hasError = true;
        yield put(error("SYNC", `Echec de la suppression de ${item.name}`));
      }
    }
    /* istanbul ignore next */
    let s = 1 < unused_items.length ? "s" : ""
    if(!hasError){
      yield put (info("SYNC",`${unused_items.length || "aucune"} ancienne${s} vidéo${s} supprimée${s}`));
    }
  }
  if(!hasError){
    yield put(setSynchronized(true));
  }
}
