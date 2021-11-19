'use strict';
import React, { useState } from 'react';
import { connect, useSelector} from 'react-redux'
import { Link } from '@react-navigation/native';

import { Button, ListItem, Segment, Text } from 'native-base';
import { View } from 'react-native';

import {getErrors, isSignedIn} from "@holusion/cache-control";
import DownloadState from './DownloadState';

export default function AppState(){
  const errors = useSelector(getErrors);
  const signedIn = useSelector(isSignedIn);
  //const state = useSelector((state)=>state);
  //console.log("State : ", state);
  let list = errors.map(({id, name, message, timestamp}) => {
      return (<ListItem key={id} style={{ flex: 1, flexDirection:"row", alignItems: "flex-start"}}>
        <View style={{flex: 0, flexDirection:"row", width: 260, justifyContent: "space-between", paddingRight: 4}}>
          <Text style={{ fontSize: 12}}>{timestamp.toLocaleString()}</Text>
          <Text style={{color:"red", fontSize: 14, fontWeight: "bold"}}>{name}</Text>
        </View>
        <View style={{display:"flex", flexDirection:'row', flexShrink: 1}}>
          <Text style={{fontSize: 14}} >{message}</Text>
        </View>
      </ListItem>)
  })

  return (<View style={{flex: 1}}>
    <Text secondary>Connexion : <Text note>{signedIn? "OK" : "en cours"}</Text></Text>
    <Text secondary>Mise en cache : </Text>
    <View style={{paddingLeft:4}}>
      <DownloadState/>
    </View>
    <Text secondary>
      Logs : 
      <Link to="/Log">
        <Text primary style={{fontSize: 14, paddingLeft: 10}}>Voir plus</Text>
      </Link>
    </Text>
    {list}
  </View>)
}
