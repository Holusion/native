'use strict';
import React, {useState, useEffect} from "react";
import { connect} from 'react-redux';
import {updateTask, setData} from "./actions";

import { getUniqueId, getApplicationName, getDeviceName } from "react-native-device-info";

import "@react-native-firebase/functions";
import "@react-native-firebase/firestore";
import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import { delay } from "./time";

import {WatchFiles} from "@holusion/cache-control";


export async function signIn(application){
  const hostname = await getDeviceName();
  const func = firebase.app().functions("europe-west1").httpsCallable("https_authDeviceCall")
  let { data: token } = await func({ 
    uuid: getUniqueId(), 
    applications: [application], 
    meta: { publicName: `${getApplicationName()}.${hostname}`} 
  });

  await auth().signInWithCustomToken(token);
}

export function useAuth({projectName, updateTask}){
  useEffect(()=>{
    if(!projectName){
      updateTask({id: "firebase", status: "warn", title:"Database", message: `no project name`})
      return
    }
    updateTask({id: "firebase", status: "pending", title:"Database", message: `Connecting`});
    let cancelled = false;
    Promise.resolve().then(async () => {
      let d = 2000;
      while(!cancelled){
        try{
          updateTask({id: "firebase", status: "pending", title:"Database", message: `Connecting`});
          await signIn(projectName);
          cancelled || updateTask({id: "firebase", status: "success", target: projectName, message: `connected to ${projectName}`})
          break;
        }catch(e){
          cancelled || updateTask({id:"firebase", status: "error", message: e.message});
          cancelled || await delay(d);
          d = Math.min(d*1.5, 60000);
          continue;
        }
      }
    })
    return ()=> {cancelled = true};
  }, [projectName, updateTask]);
};


export function useWatch({firebaseTask, setData, updateTask}){
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
      console.warn("watchFiles Progress : ", messages);
    })
    w.on("error", (err)=>{
      console.warn("WatchFiles error : ", err);
    })
    w.on("dispatch", (data)=>{
      console.warn("Dispatch data : ", JSON.stringify(
        data, 
        (k, v) =>  k && v && typeof v !== "number" ? (Array.isArray(v) ? "[object Array]" : "" + v) : v 
      ));
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
    /*
          onUpdate: (name)=>{
        updateTask({id: `sync-${name}`, title: `Sync ${name}`, status: "pending", message: "loading"})
      },
      */
  }, [setData, updateTask, w]);
}


export function Downloader({projectName, updateTask, setData, firebaseTask}){
  useAuth({projectName, updateTask});
  useWatch({setData, updateTask, firebaseTask})
  return null;
}

export const DownloadProvider = connect((state)=>({
  projectName: state.conf.projectName,
  connected: state.network.status,
  firebaseTask: state.tasks.list["firebase"] || {status: "pending"},
}), {
  setData,
  updateTask,
})(Downloader);