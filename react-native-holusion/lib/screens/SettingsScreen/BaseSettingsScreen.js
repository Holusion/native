'use strict';
import React from "react";
import {StyleSheet, TouchableWithoutFeedback} from "react-native";

import { createStackNavigator } from '@react-navigation/stack';

import {connectStyle,View, Text, List, ListItem, Header, Separator, Spinner, Content, Container, H2, Button, Left, Right, Form, Picker, Icon, Body, Badge} from "native-base";
import { useSelector } from "react-redux";
import { getActiveProduct, getErrors, isSignedIn, isRequired, isSynchronized, getOtherSize, getRequiredSize, getOtherFiles, getTotalSize, getRequiredFiles, getCachedFiles } from "@holusion/cache-control";
import { Link } from "@react-navigation/native";
import {BgIcon, Bytes} from "../../components";
import { AppConfiguration, DownloadState } from "../../containers";
import SettingsHeader from "./SettingsHeader";
import { useLocalFiles, useLocalSize } from "./CacheScreen";


export function ShowErrors(){
  const errors = useSelector(getErrors);
  return (<ListItem icon>
    <Left style={{paddingTop:4, }}>
      <Badge style={{width: 30, height: 30, borderRadius: 15, backgroundColor:errors.length ===0? BgIcon.colors["success"]: BgIcon.colors["warning"]}}>
        <Text style={{fontSize: 14, lineHeight:14, height: 14, color:"white"}}>{errors.length}</Text>
      </Badge>
    </Left>
    <Body><Link to="/Logs"><Text>{errors.length? errors.length: "Aucune"} erreur{1 < errors.length?"s":""} </Text></Link></Body>
    <Right><Link to="/Logs">
      <Icon name="chevron-forward-outline"/>
    </Link></Right>
  </ListItem>);
}

export function ShowCache(){
  const cachedFiles = useSelector(getCachedFiles);
  const requiredFiles = useSelector(getRequiredFiles);
  const otherFiles = useSelector(getOtherFiles);
  const requiredSize = useSelector(getRequiredSize);
  const otherSize = useSelector(getOtherSize);
  const totalSize = useSelector(getTotalSize);
  const localSize = useLocalSize()
  const progress = totalSize - requiredSize - otherSize
  const missingFiles = requiredFiles.length + otherFiles.length;
  
  let p = Math.round(100*progress/totalSize);
  let color;
  if(requiredSize !== 0){
    color = "#FF9966";
  }else if(otherSize !== 0){
    color = "#00a5e8"
  }
  return (<ListItem icon>
    <Left>
    {(otherSize+requiredSize !=0)? <BgIcon status="warn" name="reload"/> : <BgIcon status="success" name="checkmark"/>}
    </Left>
    <Body>
      <Text>{cachedFiles.length}/{cachedFiles.length+missingFiles} fichiers en cache</Text>
    </Body>
    <Right>
      <A to="/Cache">
      {(otherSize+requiredSize !=0) ? <Spinner style={{height:17}} size="small" color={color}/> : <Bytes style={{fontSize:17, lineHeight:17, color:"#666666"}}>{localSize}</Bytes>}
      </A>
    </Right>
  </ListItem>)
}

export function ShowTarget(){
  const default_target = useSelector((state)=> state.conf.default_target);
  const target = useSelector(getActiveProduct);
  const synchronized = useSelector(isSynchronized);
  let color = "danger";
  if(target && synchronized){
    color = "success";
  }else if(target){
    color = "warning";
  }
  return (<ListItem icon>
    <Left>
      <BgIcon status={color} name="wifi"/>
    </Left>
    <Body><Text>
      Produit connecté 
      {(target && target.name == default_target) && <Text note> (automatique)</Text>}
    </Text></Body>
    
    <Right>
      <A to="/PickProduct?t=target">
        {(target && !synchronized)? <Spinner style={{height:17}} size="small" color="#FF9966"/>: null}
        {target? target.name : "aucun"}
      </A>
    </Right>
  </ListItem>)
}

function A({to, children}){
  return <Link  to={to}>
    <Text style={{color: "#666666", lineHeight:17, fontSize: 17, minWidth:40 }}>{children}</Text>
    <Icon style={{fontSize: 16, lineHeight: 17}}name="chevron-forward-outline"/>
  </Link>
}


export default function SettingsScreen(){
  const default_target = useSelector((state)=> state.conf.default_target);
  return (<Container>
    <SettingsHeader>Settings</SettingsHeader>
    <Content settings contentContainerStyle={style.listView}>
      <Separator><Text>etat</Text></Separator>

      <ShowTarget/>

      <ShowCache/>

      <ShowErrors/>

      <Separator><Text>hologramme</Text></Separator>
      <ListItem icon>
        <Left>
          <BgIcon name="link"/>
        </Left>
        <Body>
          <Text>Produit cible par défaut</Text>
        </Body>
        <Right>
          <A to="/PickProduct?t=default">
            {default_target||"aucun"}
          </A>
        </Right>
      </ListItem>
      <Separator><Text>configuration</Text></Separator>
      <ListItem icon>
        <Left>
          <BgIcon name="construct"/>
        </Left>
        <Body>
          <Text>Interactions</Text>
        </Body>
        <Right>
          <A to="/Interactions">
          </A>
        </Right>
      </ListItem>
      <AppConfiguration/>
    </Content>
  </Container>);
}


const style = StyleSheet.create({

  modalView: {
    flex: 0,
    height: "75%",
    backgroundColor: "white",
    borderRadius: 8,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },

  listView: {
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "column"
  },
  listHeader:{
    paddingVertical: 10,
    paddingLeft: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerDoneBtn: {
    color: '#007aff',
    fontSize: 16,
  },
});
