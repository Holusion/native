'use strict';
import { eventChannel } from '@redux-saga/core';
import { select, take, call, put, cancelled } from "redux-saga/effects";
import {createSelector} from "reselect";


import {WatchChanges} from "../WatchChanges";
import { getWatch } from './conf';
import { handleSetData } from './files';
import { INITIAL_LOAD } from './status';

export const SET_DATA = "SET_DATA";

export default function data(state = {
  items: {}, //set in bulk by database applications/:appId/pages
  config: {}, //set in bulk by applications/appId
}, { type, data, error }) {
  if (error) {
    return state;
  }
  switch (type) {
    case INITIAL_LOAD:
    case SET_DATA:
      return { ...state, ...data };
    default:
      return state;
  }
}


export const getData = (state)=> state.data;
/**
 * set internal data (items or config) only one of action.items or action.config should be set.
 * @param {object} action 
 * @param {Error} [action.error] an error to be logged (data state will not be changed)
 * @param {object} [action.items] new items
 * @param {object} [action.config] project configuration
 * @param {object|Map<string, import('../WatchChanges').FileRef>} [action.files] associated files dependencies
 * 
 * @returns {object}
 */
export const setData = ({ files, error, ...data }) => {
  if(error){
    return { type: SET_DATA, error };
  }
  return { type: SET_DATA, files, data };
}

export const getConfig = (state)=> getData(state).config;
export const getItems = (state) => state.data.items;


export const getItemsIds = createSelector(
    [getItems],
    (items) => Object.keys(items)
)

export const getItemsArray = createSelector(
    [getItemsIds, getItems],
    (ids,items) => ids.map(id => Object.assign({id}, items[id]) ),
)

/**
 * simple wrapper around WatchChanges to be called by redux-saga
 * @param {string} projectName 
 * @see WatchChanges
 */
export function createWatcher(projectName){
  return new WatchChanges({projectName});
}

export function createWatchChannel(wc, watch=true) {
  return eventChannel( (emit) => {
    wc.on("error", (err)=> emit({error: err}) );
    wc.on("dispatch", (data)=> emit(data) );
    
    if(watch) wc.watch();
    else wc.getOnce();
    return ()=> {
      wc.close();
      wc.removeAllListeners();
    };
  });
}

export function* watchChanges(action) {
  const projectName = action.value;
  if(!projectName || action.error) return;
  const doWatch = yield select(getWatch);
  const wc = yield call(createWatcher, projectName);
  const watchChannel = yield call(createWatchChannel, wc, doWatch);
  try{
    while(true){
      const payload = yield take(watchChannel);
      const action = setData(payload);
      //Payload can also be an error, in which case we may need to close the loop?
      //Set file dependencies BEFORE we dispatch SET_DATA
      yield* handleSetData(action);
      yield put(action);
    }
  }finally{
    watchChannel.close();
  }
}