import { call, select, put, takeLatest } from 'redux-saga/effects'

import fs from "filesystem";
import { basename } from "filepaths";

import  { info, warn } from "../logs";

import { getCache, getFiles, unsetHash } from "./actions";

export const CLEAN_CACHE = "CLEAN_CACHE";

/**
 * Walk files in state.files.cache to remove unused ones
 * Integrated with `takeLatest(CLEAN_CACHE, cleanCache);`
 */
export function* cleanCache(){
  const cache = yield select(getCache);
  const dependencies = yield select(getFiles);
  const unused_files = Object.keys(cache).filter(name=> typeof dependencies[name] === "undefined");
  let errors = 0;
  for(let file of unused_files){
    try{
      yield call(fs.unlink, file);
      yield put(unsetHash(file));
      yield put(info(CLEAN_CACHE, `${basename(file)} supprimé du cache (inutilisé)`));
    }catch(e){
      if(e.code ==="ENOENT"){
        yield put(unsetHash(file));
      }else {
        errors++;
      }
      yield put(warn(CLEAN_CACHE, `Erreur lors de la suppression de ${basename(file)}: ${e.message}`));
    }
    if(errors ==0){
      yield put(info(CLEAN_CACHE, `cache nettoyé (${unused_files.length} fichiers supprimés)`));
    }
  }
}