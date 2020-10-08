import React from "react";
import AppState  from "./AppState";
import {useSelector} from "react-redux";

import {getPendingTasks} from "../selectors";
import { Content, Spinner } from "native-base";


export function FullLoadWrapper({children}){
  const tasks = useSelector(getPendingTasks);
  if(tasks.length !== 0){
    return <Content>
      <Spinner/>
      <AppState/>
    </Content>
  }else{
    return <React.Fragment>{children}</React.Fragment>
  }
}