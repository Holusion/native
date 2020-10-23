import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { put, all, call, select, takeLatest, throttle } from 'redux-saga/effects'

import {loadFile, saveFile} from "../readWrite";
import {createStorage} from "../path";


import files, { SET_CACHED_FILE , SET_DEPENDENCIES, handleSetData } from "./files";
import data, { SET_DATA, watchChanges } from "./data";
import conf, { getProjectName, action_strings as conf_actions_names, actions as conf_actions }  from "./conf";
import {signIn, SET_SIGNEDIN} from "./signIn";
import products from "./products"
import logs from "./logs";
import status, {INITIAL_LOAD} from "./status";


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


export function* saveCache(){
  const persistentState = yield select(state=> ({
    files: state.files,
    data: state.data,
    conf: state.conf
  }))
  const str = yield call(JSON.stringify, persistentState);
  yield call(saveFile, dataFile, str);
}

export function* loadLocalSaga(){
  yield call(createStorage);
  try{
    let str = yield call(loadFile, dataFile);
    let data = yield call(JSON.parse, str);
    yield put({type: INITIAL_LOAD, ...data});
  }catch(e){
    if(e.code == "ENOENT"){
      yield put({type: INITIAL_LOAD, error: new Error(`${dataFile} was not present on disk`)});
    }else{
      yield put({type: INITIAL_LOAD, error: new Error(`Could not load ${dataFile} : ${e.message}`)});
    }
  }
}

export function* rootSaga(){
  //Load local files only once before everything
  yield call(loadLocalSaga);
  //Sign-in
  const projectName = yield select(getProjectName);
  yield call(signIn, {projectName});
  yield all([
    takeLatest(conf_actions.SET_PROJECTNAME, signIn),
    takeLatest(SET_SIGNEDIN, watchChanges),
    takeLatest(SET_DATA, handleSetData),
    throttle(1000, [
      SET_DATA, 
      SET_DEPENDENCIES, SET_CACHED_FILE,
      ...conf_actions_names,
    ], saveCache),
  ]);
}

export function sagaStore(){
  const sagaMiddleware = createSagaMiddleware()
  const store = createStore(
    reducers,
    applyMiddleware(sagaMiddleware),
  );
  const task = sagaMiddleware.run(rootSaga)
  return [store, task];
}