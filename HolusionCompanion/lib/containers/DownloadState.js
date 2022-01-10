import React from "react";
import { isRequired, getOtherSize, getRequiredSize, getOtherFiles, getTotalSize } from "@holusion/cache-control";

import { Text } from "react-native"
import { useSelector } from "react-redux";
import Progress from "../components/Progress";


export function useSizes(){
  const requiredSize = useSelector(getRequiredSize);
  const otherSize = useSelector(getOtherSize);
  const totalSize = useSelector(getTotalSize);
  return {
    total: totalSize,
    blocking: totalSize - otherSize,
    progress: totalSize - requiredSize - otherSize,
  }
}
export default function DownloadState(){
  const {total, blocking, progress} = useSizes();
  let color;
  if(progress < blocking){
    color= '#d9534f';
  }else if(progress < total){
    color = '#62B1F6';
  }else{
    color = '#5cb85c';
  }
  let p = Math.round(100*progress/total);
  return (
  <Progress value={p} blocked={progress < blocking} pending={progress < total} complete={progress == total}>
    { progress < total ? <Text note>{p}%</Text> : <Text note style={{color: "white"}}>Synchronisé</Text>}
  </Progress>)
}