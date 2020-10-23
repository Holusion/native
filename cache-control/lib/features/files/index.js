'use strict';
import { put } from "redux-saga/effects";

export {handleDownloads} from "./handleDownloads";
export {handleSetData} from "./handleSetData";
import {SET_DEPENDENCIES, SET_CACHED_FILE} from "./actions";
import {INITIAL_LOAD} from "../status";
export * from "./actions";

export default function files(state = {
  list:{
  },
  cache: {},
  itemFiles: [],
  configFiles: [],
}, action ) {
  if(action.error) return state;
  switch(action.type){
    case INITIAL_LOAD:
      return {...state, ...action.files};
    case SET_DEPENDENCIES:
      let list = action.list
      let itemFiles = action.name === "items"? Object.keys(list) : state.itemFiles;
      let configFiles = action.name === "config"? Object.keys(list) : state.configFiles;
      let dependencies = [].concat(
        itemFiles,
        configFiles,
      )

      let raw_list = {...state.list, ...list};
      let dep_list = {};
      for (let f in raw_list){
        if(dependencies.indexOf(f) !== -1){
          dep_list[f] = raw_list[f];
        }
      }

      return {
        cache: state.cache,
        list: dep_list,
        itemFiles,
        configFiles,
      }
    case SET_CACHED_FILE:
      return {...state, cache:{...state.cache,[action.file]: action.hash}}
    default:
      return state;
  }
}
