import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { taskIds, updateTask } from "../../actions";
import { getPendingTasks, getTasks } from "../../selectors";


import { cleanup, filename } from "@holusion/cache-control";


export function useCleanup(){
  const tasks = useSelector(getTasks);
  const pendingTasks = useSelector(getPendingTasks);
  const files = useSelector(state=>state.files);
  const dispatch = useDispatch();
  useEffect(()=>{
    if(pendingTasks.length !== 0) return;
    if(!tasks[taskIds.firebase] || tasks[taskIds.firebase].status !== "success") return;
    if(!tasks["sync-items"] || tasks["sync-items"].status !== "success") return;
    if(!tasks["sync-config"] || tasks["sync-config"].status !== "success") return;
    if(!tasks[taskIds.requiredFiles] || tasks[taskIds.requiredFiles].status !== "success") return;
    let id = setTimeout(()=>{
      console.log("Running cleanup");
      cleanup(Array.from(files.keys())).then(([unlinked, kept])=>{
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
  }, [pendingTasks, tasks]);
}