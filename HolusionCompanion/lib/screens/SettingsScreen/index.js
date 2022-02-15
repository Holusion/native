'use strict';
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableWithoutFeedback, View, TextInput, KeyboardAvoidingView, Text } from "react-native";

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { H1 } from "../../components/style"

import {getConf} from "@holusion/cache-control";
import LogScreen from "./LogScreen";
import {default as BaseSettingsScreen} from "./BaseSettingsScreen";
import PickProductScreen  from "./PickProductScreen";
import CacheScreen from "./CacheScreen";
import InteractionsScreen from "./InteractionsScreen";
import { useSelector } from "react-redux";
import { useSettings } from "../../sync/hooks";

//replace by ios setting admin mode
/*
export function Auth({passcode:ref, onSubmit}){
  const [passcode, setPasscode] = useState();
  useEffect(()=>{
    if(passcode === ref) onSubmit();
  }, [passcode]);
  return <KeyboardAvoidingView behavior="position" contentContainerStyle={{padding:10, display: "flex", flexDirection:"column", justifyContent:"center", alignItems:"center", height:"100%"}}>
    <H1 primary style={{paddingTop: 15, paddingBottom: 15}}>
      Mot de passe nécessaire
    </H1>
    <View style={{ flex: 0, flexDirection:"row", justifyContent:"center"}}>
      <View style={{flex:0, width: "50%"}} >
          <TextInput style={{textAlign:"center", borderBottomWidth: 1, borderBottomColor: "#ccc"}} placeholder="****" keyboardType="numeric" autoCapitalize="none" autoCompleteType="off" secureTextEntry={true} autoCorrect={false} onChangeText={setPasscode} value={passcode}/>
      </View>
    </View>
  </KeyboardAvoidingView>
}
*/

const OptionsStack = createNativeStackNavigator();

export default function SettingsScreen({navigation}){
  const adminMode = useSettings('admin_mode');
  const onDismiss = ()=>navigation.goBack();

  let content;
  if(!adminMode){
    content = <View style={{padding:20, display: "flex", flexDirection:"column", justifyContent:"center", alignItems:"center", height:"100%"}}><Text>Veuillez activer le mode administrateur dans les paramètres pour accéder à cette interface</Text></View>
  }else{
    content = (<OptionsStack.Navigator initialRouteName="BaseSettings" headerMode= 'none' screenOptions={{headerShown: false, cardStyle: { backgroundColor: 'transparent' },}}>
      <OptionsStack.Screen name="BaseSettings" component={BaseSettingsScreen}/>
      <OptionsStack.Screen name="Logs" component={LogScreen}/>
      <OptionsStack.Screen name="Cache" component={CacheScreen}/>
      <OptionsStack.Screen name="PickProduct" component={PickProductScreen}/>
      <OptionsStack.Screen name="Interactions" component={InteractionsScreen}/>
    </OptionsStack.Navigator>)
  }
  return(
    <View style={{flex:1}}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={style.overlay}/>
      </TouchableWithoutFeedback>
      <View style={style.centeredView}>
        <View style={style.modalView}>
          {content}
        </View>
      </View>
    </View>
)
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
