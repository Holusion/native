'use strict';

import { saveFile, loadFile, cleanup, filename } from "./files";
import { setData, addTask, updateTask, setConf } from "./actions";

import { createStore } from 'redux'
import reducers from "./reducers";





export function configureStore({ projectName } = {}) {
  const initialState = reducers(undefined, {});
  if (typeof projectName !== "undefined") {
    initialState.conf.projectName = projectName;
  } else {
    initialState.conf.configurableProjectName = true;
  }
  return createStore(reducers, initialState);
};

/**
 * provides a persistence layer over redux store
 * @param {*} opts redux store initialization options
 * @returns [store, operation<Promise>] operation will resolve once all files are loaded
 */
export function persistentStore(opts) {
  const store = configureStore(opts);
  store.dispatch(addTask({ id: "loading"})); //Store is ready when loading is done
  //Dispatch data as soon as possible
  const op = Promise.resolve().then(async () => {

    store.dispatch(addTask({ id: "cleanup", status: "progress" }))
    try {
      let [unlinked, kept] = await cleanup();
      store.dispatch(updateTask({
        id: "cleanup", 
        status: "success", 
        message: `${kept.length} cached files`
          + (0 < unlinked.length ? `(removed ${2 < unlinked.length? unlinked.length: unlinked.map(f=> filename(f)).join(", ")})`: "")
      }));
    } catch (e) {
      console.warn("cleanup error", e);
      store.dispatch(updateTask({ id: "cleanup", message: e.message, status: "warn" }))
    }
    //We continue even if cleanup was a failure
    let c = {
      data: {action: setData, v: store.getState().data},
      conf: {action: setConf, v: store.getState().conf},
    }

    for (let key in c){
      store.dispatch(addTask({id:`local-${key}`, title: `Local ${key} file`}));
      try{
        let str = await loadFile(`${key}.json`);
        c[key].v = JSON.parse(str);
        store.dispatch(c[key].action(c[key].v));

        store.dispatch(updateTask({
          id:`local-${key}`, 
          message: `loaded from disk`,
          status: "success"
        }));
      }catch(e){
        store.dispatch(updateTask({ id: `local-${key}`, message: e.message, status: "warn"}));
      }
    }

    store.subscribe(function onStoreUpdate() {
      const new_state = store.getState();
      for(let key in c){
        if(new_state[key] === c[key].v){
          continue;
        }
        if(Object.keys(c[key].v).length === new_state[key].length){
          if(Object.keys(new_state[key]).every((i)=>{
            return new_state[key][i] === c[key].v[i];
          })) continue;
        }
        c[key].v = new_state[key];
        let new_str = JSON.stringify(new_state[key]);
        //saveFile happens async but is lock-protected
        saveFile(`${key}.json`, new_str)
        .then(()=>{
          store.dispatch(updateTask({ 
            id: `local-${key}`, 
            message: `updated ${new Date().toLocaleString()}`, 
            status: "success"
          }));
        })
        .catch(e => {
          console.warn(`${key}.json save error`, e);
          store.dispatch(updateTask({ id: `local-${key}`, message: e.message, status: "error"}));
        })
      }
    });
    store.dispatch(updateTask({id:"loading", status: "success", message: "OK"}));
  });

  return [store, op];
}
