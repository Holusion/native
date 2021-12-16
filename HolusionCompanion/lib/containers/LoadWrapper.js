import React, { useEffect, useState } from "react";
import AppState  from "./AppState";
import {useSelector} from "react-redux";

import { isLoaded, isBlocked, isSignedIn, isConnected } from "@holusion/cache-control";
import { StyleSheet, ScrollView, View, Text, ActivityIndicator } from "react-native";
import { H1 } from "../components/style"

import DownloadState from "./DownloadState";
import { BgIcon } from "../components";
import { Link } from "@react-navigation/native";


export function LoadInfo(){
  const connected = useSelector(isConnected);
  const signedIn = useSelector(isSignedIn);
  return <ScrollView contentContainerStyle={loadStyles.container}>
      <H1>Du contenu requis n'a pas encore été chargé</H1>
      <ActivityIndicator color="#007aff"/>
      <View style={loadStyles.status}>
        <View style={loadStyles.listView}>
          <View>
            <BgIcon status={connected?"success":"warning"} name={connected?"flash":"flash-off"}/>
          </View>
          <View style={{flex:1, paddingLeft:10}}><Text>Connexion à internet : </Text></View>
          <View><Text>{connected?"ok":"connectez votre ipad"}</Text></View>
        </View>
        <View style={loadStyles.listView}>
          <View>
            <BgIcon status={connected?"success":"warning"} name="file-tray-stacked"/>
          </View>
          <View style={{flex:1, paddingLeft:10}}><Text>Authentification : </Text></View>
          <View><Text>{signedIn?"ok":"déconnecté"}</Text></View>
        </View>
        <View style={loadStyles.listView}>
          <View/>
          <View>
            <Link to="/Settings" >
              <View style={loadStyles.settingsBtn}>
                <Text style={loadStyles.settingsText}>Paramètres</Text>
              </View>
            </Link>
          </View>
          <View/>
        </View>
        <View>
          <DownloadState/>
        </View>
      </View>
    </ScrollView >
}

const loadStyles = StyleSheet.create({
  container: {
    display:"flex", 
    flexDirection:"column",
    alignItems: "center",
    paddingTop: 150,
  },
  download: {
    width: "50%",
  },
  status:{
    width: "50%",
  },
  settingsBtn: {
    borderColor: "#007aff",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  settingsText: {
    color: "#007aff",
    fontSize: 17,
  },
  listView: {
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
})

export function RequiredLoadWrapper({children}){
  const loaded = useSelector(isLoaded);
  const blocked = useSelector(isBlocked);
  if(!loaded || blocked){
    return <LoadInfo/>
  }else{
    return <React.Fragment>{children}</React.Fragment>
  }
}

/**
 * Hoc for <RequiredLoadWrapper/>
 * @param {*} param0 
 */
export function ifRequiredLoaded(Component){
  return function RequiredLoaded(props){
    return<RequiredLoadWrapper>
      <Component {...props}/>
    </RequiredLoadWrapper>
  }
}

/**
 * Like <RequiredLoadWrapper/> but won't trigger again on  future store updates
 * @param {*} param0 
 * @see RequiredLoadWrapper
 */
export function RequiredLoadOnceWrapper({children}){
  const [hasLoaded, setHasLoaded] = useState(false);
  const loaded = useSelector(isLoaded);
  const blocked = useSelector(isBlocked);
  useEffect(()=>{
    if(!hasLoaded && !blocked && loaded){
      setHasLoaded(true);
    }
  })
  if(!hasLoaded){
    return <LoadInfo/>
  }else{
    return <React.Fragment>{children}</React.Fragment>
  }
}

export function InitialLoadWrapper({children}){
  const loaded = useSelector(isLoaded);
  if(!loaded){
    return <LoadInfo/>
  }else{
    return <React.Fragment>{children}</React.Fragment>
  }
}