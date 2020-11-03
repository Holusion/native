import React, { useEffect, useState } from "react";
import AppState  from "./AppState";
import {useSelector} from "react-redux";

import { Content, H1, Spinner, View, Text, Icon, List, ListItem, Right, Left, Body, Header, Container, Button } from "native-base";
import { isLoaded, isBlocked, isSignedIn, isConnected } from "@holusion/cache-control";
import { StyleSheet } from "react-native";

import DownloadState from "./DownloadState";
import {NetworkIcon} from "../components";
import { Link } from "@react-navigation/native";


export function LoadInfo(){
  const connected = useSelector(isConnected);
  const signedIn = useSelector(isSignedIn);
  return <Container>
    <Header>
      <Left/>
      <Body/>
      <Right>
        <Link to="/Settings">
          <NetworkIcon/>
        </Link>
      </Right>
    </Header>
    <Content contentContainerStyle={loadStyles.container}>
      <H1 style={loadStyles.title}>Du contenu requis n'a pas encore été chargé</H1>
      <Spinner color="#007aff"/>
      <List style={loadStyles.status}>
        <ListItem icon>
          <Left>
            <Button style={{backgroundColor:connected?"#5cb85c":"#f0ad4e"}} >
              <Icon active name={connected?"flash":"flash-off"}/>
            </Button>
          </Left>
          <Body><Text>Connexion à internet : </Text></Body>
          <Right><Text>{connected?"ok":"connectez votre ipad"}</Text></Right>
        </ListItem>
        <ListItem icon>
          <Left>
            <Button style={{backgroundColor:connected?"#5cb85c":"#f0ad4e"}} >
              <Icon active name="file-tray-stacked"/>
            </Button>
          </Left>
          <Body><Text>Authentification : </Text></Body>
          <Right><Text>{signedIn?"ok":"déconnecté"}</Text></Right>
        </ListItem>
        <ListItem last>
          <Left/>
          <Body>
            <Link to="/Settings" >
              <View style={loadStyles.settingsBtn}>
                <Text style={loadStyles.settingsText}>Paramètres</Text>
              </View>
            </Link>
          </Body>
          <Right/>
        </ListItem>
        <View>
          <DownloadState/>
        </View>
      </List>
    </Content>
    
  </Container>
}

const loadStyles = StyleSheet.create({
  container: {
    display:"flex", 
    flexDirection:"column",
    alignItems: "center",
    paddingTop: 150,
  },
  title: {
    fontSize: 21,
    lineHeight: 21,
    color: "#007aff"
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
  }
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