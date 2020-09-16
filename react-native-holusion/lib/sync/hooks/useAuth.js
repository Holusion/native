'use strict';
import {useEffect} from "react";


import "@react-native-firebase/functions";
import "@react-native-firebase/firestore";
import { delay } from "../../time";

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