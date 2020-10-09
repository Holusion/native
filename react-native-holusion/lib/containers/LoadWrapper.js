import React, { useEffect, useState } from "react";
import AppState  from "./AppState";
import {useSelector} from "react-redux";

import {getPendingTasks, getBlockingTasks} from "../selectors";
import { Content, H1, Spinner } from "native-base";


export function FullLoadWrapper({children}){
  const tasks = useSelector(getPendingTasks);
  if(tasks.length === 0){
    return <Content>
      <Spinner/>
      <AppState/>
    </Content>
  }else{
    return <React.Fragment>{children}</React.Fragment>
  }
}
export function InitialLoadWrapper({children}){
  const tasks = useSelector(getBlockingTasks);
  if(tasks.filter(t=>t.status !== "success").length != 0){
    return <Content>
      <H1>Du contenu requis n'a pas été chargé</H1>
      <Spinner/>
      <AppState/>
    </Content>
  }else{
    return <React.Fragment>{children}</React.Fragment>
  }
}