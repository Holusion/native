'use strict';
import {useState, useEffect} from "react";

import "@react-native-firebase/functions";
import "@react-native-firebase/firestore";

import {WatchChanges} from "@holusion/cache-control";

/**
 * @deprecated use redux-saga tasks from @holusion/cache-control
 * 
 * @param {Object} param0 
 * @param {Object} param0.firebaseTask - The state of firebase Task in Redux
 * @param {function} param0.setData - setData redux dispatch
 * @param {function} param0.updateTask - updateTask redux dispatch
 * @returns undefined
 */
export function useWatch({
  firebaseTask, 
  setData, 
  updateTask,
}){
  const projectName = firebaseTask.target;
  const [w, setWatch] = useState();
  useEffect(()=>{
    let watcher = new WatchChanges({
      projectName,
    })
    setWatch(watcher);
  }, [projectName]);

  useEffect(()=>{
    if(firebaseTask.status !== "success") return;
    if(!w) return;
    
    w.on("start",(name)=>{
      //console.info("Start synchronizing", name);
      //start events should always be followed by "error" or "dispatch".
      updateTask({id:`sync-${name}`, status: "pending", message:`synchronizing...`});
    })
    w.on("error", (err)=>{
      switch(err.name){
        case "data.config":
          updateTask({id:`sync-config`, status: "error", message:err.message, error: err});
          break;
        case "data.items":
          updateTask({id:`sync-items`, status: "error", message:err.message, error: err});
          break;
        default:
          updateTask({id:`sync-unknown`, status: "error", message:err.message, error: err});
      }
    })
    w.on("dispatch", (data)=>{
      setData(data);
      Object.keys(data).forEach((name)=>{
        updateTask({id:`sync-${name}`, status: "success", message:`synchronized ${new Date().toLocaleString()}`})
      })
    })
    
    w.watch();
    return ()=>{
      w.close();
    }
  }, [setData, updateTask, w]);
}
