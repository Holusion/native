import { put } from "redux-saga/effects";
import {setDependencies} from "./actions";
/**
 * handle setData actions
 * @param {object} param0
 * @param {object} param0.data - affected data items
 * @param {Map<string,import("../../WatchChanges").FileRef>|object} [param0.files]
 * @param {Error} [param0.error]
 */
export function* handleSetData({error, data, files}){
  if(error) return
  //Dispatch the new files list
  let list = (files instanceof Map)? Object.fromEntries(files): files || {};
  yield put(setDependencies(data['config']?"config": "items", list));
}



