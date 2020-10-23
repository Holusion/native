'use strict';
import { eventChannel } from 'redux-saga'
import { select, take, call, put, cancelled } from "redux-saga/effects";
import {createSelector} from "reselect";


import {WatchChanges} from "../WatchChanges";
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

export function createWatcher(projectName){
  return new WatchChanges({projectName});
}

export function createWatchChannel(wc) {
  return eventChannel(emit => {
    wc.on("error", (err)=> emit({error: err}) );
    wc.on("dispatch", (data)=> emit(data) );
    
    wc.watch();
    return ()=> {
      wc.close();
      wc.removeAllListeners();
    };
  });
}

export function* watchChanges(action) {
  const {projectName} = action;
  const wc = yield call(createWatcher, projectName);
  const watchChannel = yield call(createWatchChannel, wc);
  try{
    while(true){
      const payload = yield take(watchChannel);
      //Payload can also be an error, in which case we may need to close the loop?
      yield put(setData(payload));
    }
  }finally{
    watchChannel.close();
  }
}