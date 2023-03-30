'use strict';
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, Text, View, ActivityIndicator, KeyboardAvoidingView } from "react-native";
import { getReadableVersion } from "react-native-device-info";
import { useLinkProps } from '@react-navigation/native';

import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from "react-redux";
import { getActiveProduct, getErrors, isSignedIn, isRequired, isSynchronized, getOtherSize, getRequiredSize, getOtherFiles, getTotalSize, getRequiredFiles, getCachedFiles, setPurge, getConf, setProjectName } from "@holusion/cache-control";

import CheckBox from "@react-native-community/checkbox";
import { BgIcon, Bytes} from "../../components";
import { theme } from "../../components/style"
import { AppConfiguration } from "../../containers";
import SettingsHeader from "./SettingsHeader";
import { useLocalSize } from "./CacheScreen";


function LinkLine({to, action, children, style:forcedStyle, ...props}){
  const { onPress, ...linkProps } = useLinkProps({ to, action });

  return (<TouchableOpacity {...linkProps} {...props} style={forcedStyle ?? style.listView} onPress={onPress} >
    {children}
  </TouchableOpacity>);
}

function Carret({children}){
  return <View style={{minWidth:50, height:30, flex: 1, flexDirection:"row"}}>
    <Text style={{color: "#666666", minWidth:40 }}>{children}</Text>
    <Icon style={{fontSize: 16, lineHeight: 17, textAlign:"right"}}name="chevron-forward-outline"/>
  </View>
}

export function ShowErrors(){
  const errors = useSelector(getErrors);
  return (<LinkLine to="/Logs">
    <View>
      <View style={{width: 30, height: 30, borderRadius: 15, backgroundColor:errors.length ===0? BgIcon.color["success"]: BgIcon.color["warning"]}}>
        <Text style={{fontSize: 14, lineHeight: 30, color:"white", textAlign: "center"}}>{errors.length}</Text>
      </View>
    </View>
    <View style={{flex:1, paddingLeft:10}}>
      <Text>{errors.length? errors.length: "Aucune"} erreur{1 < errors.length?"s":""} </Text>
    </View>
    <View>
      <Carret/>
    </View>
  </LinkLine>);
}

export function ShowFirestore(){
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const {projectName} = useSelector(getConf);
  const signedIn = useSelector(isSignedIn);
  const onPress = ()=>{
    setLoading(true);
    dispatch(setProjectName(projectName));
    setTimeout(()=>{
      setLoading(false);
    }, 5000);
  }
  return <View style={style.listView}>
    <View>
      <BgIcon status={signedIn?"success": "muted"} name="ios-code-working"/>
    </View>
    <View style={{flex:1, paddingLeft:10}}>
      <Text>Lien vers content.holusion.com</Text>
    </View>
    <View>
      {signedIn ? <Text style={{color: "#666666"}}>connecté</Text> : 
      (loading? <ActivityIndicator size="small"/> : <TouchableOpacity small transparent onPress={onPress}><View><Text style={{color: "#666666"}}>déconnecté</Text><Icon style={{color:"#666666"}} name="refresh"/></View></TouchableOpacity>)}
    </View>
  </View>
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
  return (<LinkLine to="/Cache">
    <View>
    {(otherSize+requiredSize !=0)? <BgIcon status="warn" name="reload"/> : <BgIcon status="success" name="checkmark"/>}
    </View>
    <View style={{flex:1, paddingLeft:10}}>
      <Text>{cachedFiles.length}/{cachedFiles.length+missingFiles} fichiers en cache</Text>
    </View>
    <View>
      <Carret>
      {(otherSize+requiredSize !=0) ? <ActivityIndicator style={{height:17}} size="small" color={color}/> : <Bytes style={{color:"#666666"}}>{localSize}</Bytes>}
      </Carret>
    </View>
  </LinkLine>)
}

export function ShowTarget(){
  const {default_target} = useSelector(getConf);
  const target = useSelector(getActiveProduct);
  const synchronized = useSelector(isSynchronized);
  let color = "danger";
  if(target && synchronized){
    color = "success";
  }else if(target){
    color = "warning";
  }
  return (<LinkLine to="/PickProduct?t=target">
    <View>
      <BgIcon status={color} name="wifi"/>
    </View>
    <View style={{flex:1, paddingLeft:10}}><Text>
      Produit connecté 
      {(target && target.name == default_target) && <Text note> (automatique)</Text>}
    </Text></View>
    
    <View>
      <Carret>
        {(target && !synchronized)? <ActivityIndicator style={{height:17}} size="small" color="#FF9966"/>: null}
        {target? target.name : "aucun"}
      </Carret>
    </View>
  </LinkLine>)
}


export default function SettingsScreen(){
  const dispatch = useDispatch();
  const {default_target, purge_products} = useSelector(getConf);
  return (
    <ScrollView>
    <KeyboardAvoidingView behavior={"position"}>

    <SettingsHeader>Settings</SettingsHeader>

      <View style={style.listHeader}>
        <Text style={style.listTitle}>Etat</Text>
      </View>

      <ShowTarget/>

      <ShowCache/>

      <ShowFirestore/>

      <ShowErrors/>

      <View style={style.listHeader}>
        <Text style={style.listTitle}>Hologramme</Text>
      </View>
      
      <LinkLine to="/PickProduct?t=default">
        <View>
          <BgIcon name="link"/>
        </View>
        <View style={{flex:1, paddingLeft:10}}>
          <Text>Produit cible par défaut</Text>
        </View>
        <View>
          <Carret>
            {default_target||"aucun"}
          </Carret>
        </View>
      </LinkLine>
      <View style={style.listView}>
        <View>
          <BgIcon name="trash"/>
        </View>
        <View style={{flex:1, paddingLeft:10}}>
            <Text>Supprimer les vidéos inutiles sur l'hologramme</Text>
        </View>
        <View>
          <CheckBox lineWidth={1} animationDuration={0} value={purge_products} onValueChange={()=>dispatch(setPurge(!purge_products))} />
        </View>
      </View>

      <View style={style.listHeader}>
        <Text style={style.listTitle}>Configuration</Text>
      </View>

      <LinkLine to="/Interactions">
        <View>
          <BgIcon name="construct"/>
        </View>
        <View style={{flex:1, paddingLeft:10}}>
          <Text>Interactions</Text>
        </View>
        <View>
          <Carret/>
        </View>
      </LinkLine>
      <AppConfiguration style={style}/>
      <View style={style.listView}>
        <View><BgIcon name="logo-apple-appstore"/></View>
        <View style={{flex:1, paddingLeft:10}}><Text>Version</Text></View>
        <View><Text>{getReadableVersion()}</Text></View>
      </View>
    </KeyboardAvoidingView>

    </ScrollView>

);
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
    flex: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  listHeader:{
    padding: 10,
    borderColor: theme.color.light,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    backgroundColor: theme.color.light
  },
  listTitle:{
    fontWeight: "bold",
  }
});
