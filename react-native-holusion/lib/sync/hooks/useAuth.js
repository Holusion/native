'use strict';
import {useEffect} from "react";


import "@react-native-firebase/functions";
import "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import firebase from "@react-native-firebase/app";

import { getUniqueId, getApplicationName, getDeviceName } from "react-native-device-info";

import { delay } from "../../time";



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




/**
 * 
 * @param {Object} param0 
 * @param {?string} param0.projectName - The target firebase "application" name
 * @param {function} param0.updateTask - Bound updateTask action
 * @returns undefined
 */
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