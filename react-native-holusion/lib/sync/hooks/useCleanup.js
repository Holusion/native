import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { taskIds, updateTask } from "../../actions";
import { getPendingTasks } from "../../selectors";


import { cleanup, filename } from "@holusion/cache-control";


export function useCleanup(){
  const {length} = useSelector(getPendingTasks);
  const dispatch = useDispatch();
  useEffect(()=>{
    if(length !== 0) return;
    let id = setTimeout(()=>{
      console.log("Running cleanup");
      cleanup().then(([unlinked, kept])=>{
        dispatch(updateTask({
          id: taskIds.cleanup, 
          title: "Nettoyage",
          status: "success", 
          message: `${kept.length} cached files`
            + (0 < unlinked.length ? `(removed ${2 < unlinked.length? unlinked.length: unlinked.map(f=> filename(f)).join(", ")})`: "")
        }));
      }).catch(e=>{
        console.warn("cleanup", e);
        dispatch(updateTask({
          id: taskIds.cleanup,
          title: "Nettoyage",
          message: e.message,
          status: "warn" 
        }))
      })
    }, 30*1000);
    return ()=>clearTimeout(id);
  }, [length]);
}