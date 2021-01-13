import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { put, all, call, select, takeLatest, debounce } from 'redux-saga/effects'

import {loadFile, saveFile} from "../readWrite";
import {createStorage} from "../path";


import files, { SET_CACHED_FILE , SET_DEPENDENCIES, handleDownloads } from "./files";
import data, { SET_DATA, watchChanges } from "./data";
import conf, { getProjectName, action_strings as conf_actions_names, actions as conf_actions, setProjectName }  from "./conf";
import {signIn} from "./signIn";
import products, { SET_ACTIVE_PRODUCT } from "./products"
import logs, { info } from "./logs";
import status, {INITIAL_LOAD, SET_SIGNEDIN, SET_SYNCHRONIZED} from "./status";
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


export const getPersistentState = (state)=>({
  files: state.files,
  data: state.data,
  conf: state.conf
});

export function* saveCache(action){
  const persistentState = yield select(getPersistentState)
  const str = yield call(JSON.stringify, persistentState);
  try{
    yield call(saveFile, dataFile, str);
    yield put(info("SAVE_CACHE", `Données locales sauvegardées`, `Déclenché par ${action.type}`));
  }catch(e){
    //console.log("Save cache fail on trigger : ", action.type);
    yield put({type:"SAVE_CACHE", error: e});
  }
}

export function* loadLocalSaga(){
  yield call(createStorage);
  try{
    let str = yield call(loadFile, dataFile);
    let data = yield call(JSON.parse, str);
    yield put({type: INITIAL_LOAD, ...data});
  }catch(e){
    if(e.code == "ENOENT"){
      yield put(info(INITIAL_LOAD, `${dataFile} n'existait pas`, "Soit c'est une nouvelle installation soit le fichier a été perdu"))
      yield put({type: INITIAL_LOAD});
    }else{
      yield put({type: INITIAL_LOAD, error: new Error(`Could not load ${dataFile} : ${e.message}`)});
    }
  }
}

export function* rootSaga(){
  //Load local files only once before everything
  yield call(loadLocalSaga);

  const projectName = yield select(getProjectName);
  yield all([
    takeLatest(conf_actions.SET_PROJECTNAME, signIn),
    takeLatest(SET_DEPENDENCIES, handleDownloads),
    takeLatest(SET_SIGNEDIN, watchChanges),
    takeLatest([SET_ACTIVE_PRODUCT, SET_CACHED_FILE, conf_actions.SET_PURGE], synchronizeProduct),
    debounce(500, [
      SET_DATA, 
      SET_DEPENDENCIES, SET_CACHED_FILE,
      ...conf_actions_names,
    ], saveCache),
    call(signIn, {projectName}),
  ]);
}
//Does not natively support hot-reload
// https://github.com/redux-saga/redux-saga/issues/1961
export function sagaStore({defaultProject}={}){
  const sagaMiddleware = createSagaMiddleware();
  let initialState = reducers(undefined, {});
  //Apply initial setup
  if(defaultProject){
    initialState = reducers(initialState, setProjectName(defaultProject));
  }
  const store = createStore(
    reducers,
    initialState,
    applyMiddleware(sagaMiddleware),
  );
  const task = sagaMiddleware.run(rootSaga)
  return [store, task];
}