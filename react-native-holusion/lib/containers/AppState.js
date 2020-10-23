'use strict';
import React from 'react';
import { connect} from 'react-redux'

import { ListItem, Text } from 'native-base';
import { View } from 'react-native';


function AppState(props){
  let list = Object.keys(props.taskList).sort().map((taskId)=>{
      let t = props.taskList[taskId];
      let color;
      switch(t.status){
          case "success":
              color="green";
              break;
          case "disconnected":
              color="orange";
              break;
          case "error":
              color="red";
              break;
          case "pending":
              color= "orange";
              break;
          default:
              color="blue";
              break;
      }
      return (<ListItem key={taskId} style={{justifyContent:"space-between", flex: 1, flexDirection:"row"}}>
          <Text >{t.title || taskId} : </Text>
          <Text style={{color, fontSize: 14}} >{t.message || t.status}</Text>
      </ListItem>)
  })
  return (<View>
      {list}
      {props.logs.map((l, idx)=><Text key={idx}>{l.message}</Text>)}
    </View>)
}

const ConnectedAppState = connect(
  ({tasks, logs})=>({
      taskList: tasks.list,
      logs,
  }), 
  {}
)(AppState);
export default ConnectedAppState;