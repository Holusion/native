import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { put, all, call, select, takeLatest, debounce, delay } from 'redux-saga/effects'

import {loadFile, saveFile} from "../readWrite";
import {createStorage} from "../path";


import files, { SET_CACHED_FILE , SET_DEPENDENCIES, handleDownloads,  cleanCache, CLEAN_CACHE, getUncachedFiles } from "./files";
import data, { SET_DATA, watchChanges } from "./data";
import conf, { getProjectName, action_strings as conf_actions_names, actions as conf_actions, getAutoClean, setConf }  from "./conf";
import {signIn, DO_SIGNIN} from "./signIn";
import products, { SET_ACTIVE_PRODUCT } from "./products"
import logs, { info } from "./logs";
import status, { INITIAL_LOAD, SET_SIGNEDIN } from "./status";
import { synchronizeProduct } from './sync';


export * from "./conf";
export * from "./data";
export * from "./files";
export * from "./logs";
export * from "./status";
export * from "./products";

export const reducers = combineReducers({
  data,
  files,
  conf,
  products,
  logs,
  status,
});

/* file names may be bumped when internal syntax changes to prevent parse errors */
export const dataFile = "data_v1.json";

/**
 * Restricts state to what should be persisted
 */
export const getPersistentState = ({files, data, conf})=>({
  files,
  data,
  conf,
});

export function* saveCache(action){
  const persistentState = yield select(getPersistentState)
  const str = yield call(JSON.stringify, persistentState);
  try{
    yield call(saveFile, dataFile, str);
    yield put(info("SAVE_CACHE", `Données locales sauvegardées`, `Déclenché par ${action.type}`));
  }catch(e){
    yield put({type:"SAVE_CACHE", error: e});
    return;   //Stop here on error
  }
  const shouldClean = yield select(getAutoClean);
  if(!shouldClean) return;
  //Save cache was successful. Attempt cleaning up after a delay
  yield delay(5000); // Larger debounce
  const missingFiles = yield select(getUncachedFiles);
  if(missingFiles.length != 0) return;
  yield put({type:CLEAN_CACHE});
}

export function* loadLocalSaga(){
  yield call(createStorage);
  try{
    let str = yield call(loadFile, dataFile);
    let persistedState = yield call(JSON.parse, str);
    yield put({type: INITIAL_LOAD, ...persistedState});
  }catch(e){
    if(e.code == "ENOENT"){
      yield put(info(INITIAL_LOAD, `${dataFile} n'existait pas`, "Soit c'est une nouvelle installation soit le fichier a été perdu"))
      yield put({type: INITIAL_LOAD});
    }else{
      yield put({type: INITIAL_LOAD, error: new Error(`Could not load ${dataFile} : ${e.message}`)});
    }
  }
}

/**
 * Initializes a store from local data if available.
 * 
 * Creates an event loop that reacts to state changes by triggering side-effects
 * Loops running in parallel : 
 * - signIn (tries to sign-in when projectName changes)
 * - handleDownloads (fetch new files on dependencies change)
 * - watchChanges firestore connector. Fetch document updates. Can also be triggered with GET_DATA
 * - synchronizeProduct when target product changes or data is updated
 * - saveCache when state persistent change happens (debounced to 500ms)
 * - autoClean when a file is added to cache
 * 
 * After all this, calls signIn with current projectName to start the download sequence if possible.
 */
export function* rootSaga(){
  //Load local files only once before everything
  yield call(loadLocalSaga);

  const projectName = yield select(getProjectName);

  // run everything in parallel
  // those tasks won't ever return unless cancelled
  yield all([
    takeLatest([DO_SIGNIN, conf_actions.SET_PROJECTNAME], signIn),
    takeLatest(SET_DEPENDENCIES, handleDownloads),
    takeLatest([SET_SIGNEDIN, conf_actions.SET_WATCH], watchChanges),
    takeLatest([SET_ACTIVE_PRODUCT, SET_CACHED_FILE, conf_actions.SET_PURGE], synchronizeProduct),
    debounce(500, [
      SET_DATA, 
      SET_DEPENDENCIES, SET_CACHED_FILE,
      ...conf_actions_names,
    ], saveCache),
    takeLatest(CLEAN_CACHE, cleanCache),
    call(signIn, {projectName}), //Start signIn attempt
  ]);
}

/**
 * Create and start data-sync routine
 * @see rootSaga
 * @bug Does not natively support hot-reload. See : https://github.com/redux-saga/redux-saga/issues/1961
 * @param {Partial<import('./conf').AppConf>} [overrides] override data
 * @returns {[import('redux').Store, import("redux-saga").Task]}
 */
export function sagaStore(overrides){
  const sagaMiddleware = createSagaMiddleware();
  //Apply initial setup
  let initialState = reducers(undefined, (overrides? setConf(overrides): {}));

  const store = createStore(
    reducers,
    initialState,
    applyMiddleware(sagaMiddleware),
  );
  const task = sagaMiddleware.run(rootSaga)
  return [store, task];
}