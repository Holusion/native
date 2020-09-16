'use strict';
import {useState, useEffect} from "react";

import "@react-native-firebase/functions";
import "@react-native-firebase/firestore";

import {WatchFiles} from "@holusion/cache-control";

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
    w.on("progress", (...messages)=>{
      logger.onProgress( messages);
    })
    w.on("error", (err)=>{
      logger.onError(err);
    })
    w.on("dispatch", (data)=>{
      logger.onDispatch(data);
      setData(data);
      Object.keys(data).forEach((name)=>{
        console.log("Done synchronizing", name);
        updateTask({id:`sync-${name}`, status: "success", message:`synchronized ${new Date().toLocaleString()}`})
      })
    })
    
    w.watch();
    return ()=>{
      w.close();
    }
  }, [setData, updateTask, w]);
}
