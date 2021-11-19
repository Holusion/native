import { useEffect } from "react";

import {handleFiles} from "@holusion/cache-control";
import { useSelector } from "react-redux";
import {taskIds} from "../../actions";

export function useDownload({updateTask}){
  const files = useSelector(s=> s.files);
  useEffect(()=>{
    let cancelled = false;
    (async ()=>{
      let it = handleFiles(files); //for await ... of doesn't work well with babel
      let res = await it.next();
      while(!res.done){
        if(cancelled) return;
        let p = res.value;
        if(p.blocking){
          updateTask({id:taskIds.requiredFiles, title:"Fichiers requis", status: "pending", message:`Téléchargement : ${Math.round(100*p.progress/p.requiredSize)}%`})
        }else{
          updateTask({id:taskIds.requiredFiles, title:"Fichiers requis", status: "success", message:`Terminé`})
        }
        if(p.requiredSize < p.totalSize){
          updateTask({id:taskIds.otherFiles, title:"Autres fichiers", status: "pending", message:`Téléchargement : ${Math.round(100*Math.max(0,p.progress-p.requiredSize)/p.totalSize)}%`})
        }
        res = await it.next();
      }
      
      updateTask({id:taskIds.requiredFiles, title:"Fichiers requis", status: "success", message:`Synchronisé ${new Date().toLocaleString()}`})
      updateTask({id:taskIds.otherFiles, title:"Autres fichiers", status: "success", message:`Synchronisé ${new Date().toLocaleString()}`})

    })().catch((e)=>{
      console.warn("handleFiles error : ", e);
      updateTask({id:taskIds.otherFiles, title:"Autres fichiers", status: "error", message:`Erreur : ${e.message}`, error: e})
    })
    return ()=> {cancelled = true};
  }, [files, updateTask]);
}