'use strict';
import {useState, useEffect} from "react";

import "@react-native-firebase/functions";
import "@react-native-firebase/firestore";

import {WatchFiles} from "@holusion/cache-control";

/**
 * 
 * @param {Object} param0 
 * @param {Object} param0.firebaseTask - The state of firebase Task in Redux
 * @param {function} param0.setData - setData redux dispatch
 * @param {function} param0.updateTask - updateTask redux dispatch
 * @param {Logger} logger - a logger object
 * @returns undefined
 */
export function useWatch({
  firebaseTask, 
  setData, 
  updateTask,
  logger,
}){
  const projectName = firebaseTask.target;
  const [w, setWatch] = useState();
  useEffect(()=>{
    let watcher = new WatchFiles({
      projectName,
    })
    setWatch(watcher);
  }, [projectName]);

  useEffect(()=>{
    if(firebaseTask.status !== "success") return;
    if(!w) return;
    
    w.on("start",(name)=>{
      console.log("Start synchronizing", name);
      //start events should always be followed by "error" or "dispatch".
      updateTask({id:`sync-${name}`, status: "pending", message:`synchronizing...`});
    })
    w.on("progress", (...messages)=>{
      logger.onProgress( messages);
    })
    w.on("error", (err)=>{
      switch(e.name){
        case "data.config":
          updateTask({id:`sync-config`, status: "error", message:e.message});
          break;
        case "data.items":
          updateTask({id:`sync-items`, status: "error", message:e.message});
          break;
      }
      logger.onError(err);
    })
    w.on("dispatch", (data)=>{
      logger.onDispatch(data);
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
