
import { put, takeLatest, take, takeEvery, cancelled, select, call, fork } from "redux-saga/effects";

import writeToFile from "writeToFile";

import {SET_DEPENDENCIES, getRequiredFiles, getOtherFiles, setHash, SET_CACHED_FILE, getFiles, isCached} from "./actions";

export const REQUEST_DOWNLOAD = "REQUEST_DOWNLOAD";
/**
 * Meant to be used with takeLatest(SET_DEPENDENCIES, handleDownload)
 * */
export function* schedule_downloads(){
  const required = yield select(getRequiredFiles);
  const other = yield select(getOtherFiles);
  const list = yield select(getFiles);
  for(let files of [required, other]){
    for(let dest of files){
      const file = list[dest];
      yield put({type: REQUEST_DOWNLOAD, dest: dest, src:file.src, hash: file.hash});
      while(true){
        let cached = yield take(SET_CACHED_FILE);
        if(cached.file === dest && cached.hash === file.hash) break;
      }
    }
  }
}

export function* do_download(){
  while(true){
    const {src, dest, hash} = yield take(REQUEST_DOWNLOAD);
    //Check if file was downloaded between the time request was issued and now
    if( !( yield select(isCached, dest, hash) )){
      yield call(writeToFile, src, dest);
    }
    yield put(setHash(dest, hash));
  }
}

export function* handleDownloads(){
  yield fork(do_download);
  yield call(schedule_downloads)
  yield takeLatest(SET_DEPENDENCIES, schedule_downloads);
}