'use strict';
import React, { useEffect, useState } from "react";
import {StyleSheet, TouchableWithoutFeedback} from "react-native";

import { createStackNavigator } from '@react-navigation/stack';

import {Form, H1, Input, Item, View} from "native-base";


import {getConf} from "@holusion/cache-control";
import LogScreen from "./LogScreen";
import {default as BaseSettingsScreen} from "./BaseSettingsScreen";
import PickProductScreen  from "./PickProductScreen";
import CacheScreen from "./CacheScreen";
import InteractionsScreen from "./InteractionsScreen";
import { useSelector } from "react-redux";


export function Auth({passcode:ref, onSubmit}){
  const [passcode, setPasscode] = useState();
  useEffect(()=>{
    if(passcode === ref) onSubmit();
  }, [passcode]);
  return <View style={{padding:10, display: "flex", flexDirection:"column", justifyContent:"center", alignItems:"center", height:"100%"}}>
    <H1 primary style={{paddingTop: 15, paddingBottom: 15}}>
      Mot de passe nécessaire
    </H1>
    <Form style={{ flex: 0, flexDirection:"row", justifyContent:"center"}}>
      <Item last style={{flex:0, width: "50%"}} >
          <Input style={{textAlign:"center"}} placeholder="****" keyboardType="numeric" autoCapitalize="none" autoCompleteType="off" secureTextEntry={true} autoCorrect={false} onChangeText={setPasscode} value={passcode}/>
      </Item>
    </Form>
  </View>
}


const OptionsStack = createStackNavigator();

export default function SettingsScreen({navigation}){
  const {passcode} = useSelector(getConf);
  const [authorized, setAuthorized] = useState(!passcode);
  const onDismiss = ()=>navigation.goBack();

  let content;
  if(!authorized){
    content = <Auth passcode={passcode} onSubmit={()=>setAuthorized(true)}/>
  }else{
    content = (<OptionsStack.Navigator initialRouteName="BaseSettings" headerMode= 'none' screenOptions={{headerShown: false, cardStyle: { backgroundColor: 'transparent' },}}>
      <OptionsStack.Screen name="BaseSettings" component={BaseSettingsScreen}/>
      <OptionsStack.Screen name="Logs" component={LogScreen}/>
      <OptionsStack.Screen name="Cache" component={CacheScreen}/>
      <OptionsStack.Screen name="PickProduct" component={PickProductScreen}/>
      <OptionsStack.Screen name="Interactions" component={InteractionsScreen}/>
    </OptionsStack.Navigator>)
  }
  return(<View style={{flex:1}}>
    <TouchableWithoutFeedback onPress={onDismiss}>
      <View style={style.overlay}/>
    </TouchableWithoutFeedback>
    <View style={style.centeredView}>
      <View style={style.modalView}>
        {content}
      </View>
    </View>
  </View>)
}




const style = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  centeredView: {
    marginHorizontal: "25%",
    marginTop: 70,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalView: {
    flex: 0,
    height: "75%",
    backgroundColor: "white",
    borderRadius: 8,
    alignItems: "stretch",
    overflow: "hidden",
  },
})
