import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';

import "react-native-gesture-handler";
import { enableScreens } from 'react-native-screens';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { useSettings } from './lib/sync/hooks';


import { StatusBar, ActivityIndicator, View, Button, StyleSheet, Text } from "react-native"

import {sagaStore} from "@holusion/cache-control";

import { screens, NetworkIcon, useNetScan, ifRequiredLoaded, ErrorHandler, withErrorHandler } from './lib';
import {H1, H2, ThemeProvider} from "./lib/components/style"


enableScreens();

const Stack = createNativeStackNavigator();


const HomeScreen = withErrorHandler(ifRequiredLoaded(screens.HomeScreen));
const ListScreen = withErrorHandler(ifRequiredLoaded(screens.ListScreen));
const ObjectScreen = withErrorHandler(ifRequiredLoaded(screens.ObjectScreen));
const SettingsScreen = withErrorHandler(screens.SettingsScreen);
const NotFoundScreen = withErrorHandler(screens.NotFoundScreen);
//const ContactScreen = withErrorHandler(screens.ContactScreen);

/**
 * Main node that contains the nav router
 */
function MainContent(){
  const [notFound, setNotFound] = useState(null);
  const adminMode = useSettings('admin_mode');
  const screenOptions = ({navigation})=>{
    return {
      headerBackTitle: "Retour",
      headerRight: ()=>(adminMode && <NetworkIcon onPress={() => navigation.navigate("Settings")}/>),
    };
  }

  const handle404 = ({payload, type})=>{
    let message = `The action '${type}'${
      payload ? ` with payload ${JSON.stringify(payload)}` : ''
    } was not handled by any navigator.`;
    console.warn(message);
    switch(type){
      case "NAVIGATE":
        message = `Pas de page nommée '${payload.name}${payload?.params?.id?"/"+payload.params.id:""}'`;
        break;
    }
    setNotFound({type, message});
  }

  let notFoundModal = notFound?(<View style={styles.modalView}>
    <H1 style={{padding: 15}}>Page non trouvée</H1>
    <H2>Action : {notFound.type}</H2>
    <Text style={{fontSize: 22, padding: 10}}>{notFound.message}</Text>
    <Button title="Retour" style={{padding: 15}}onPress={()=> setNotFound(null)}/>
  </View>): null;

  return (<>
    <NavigationContainer onUnhandledAction={handle404} theme={{...DefaultTheme,colors: {...DefaultTheme.colors, background : 'white'}}}>
      <Stack.Navigator screenOptions={screenOptions}  initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="List" component={ListScreen}/>
        <Stack.Screen name="Object" options={{ headerShown: false }} component={ObjectScreen}/>
        <Stack.Screen name="Settings" options={{presentation:"transparentModal", headerShown: false}} component={SettingsScreen}/>
        {/*<Stack.Screen name="Contact" options={{stackPresentation:"formSheet"}} component={ContactScreen}>*/}
      </Stack.Navigator>
    </NavigationContainer>
    {notFoundModal}
  </>)
}

function NetAwareContent(){
  useNetScan();
  return (<MainContent/>);
}

export default function App(){
  const [store, task] = sagaStore({defaultProject:"holodemo"});



  return <React.Fragment>
  <StatusBar hidden={true} />
   <ErrorHandler>
     {store?<Provider store={store}>
       <ThemeProvider>
        <NetAwareContent/>
       </ThemeProvider>
     </Provider> : <ActivityIndicator/>}
   </ErrorHandler>
</React.Fragment>
}

const styles = StyleSheet.create({
  modalView: {
    position: "absolute",
    flex: 0,
    width: "50%",
    top: 100,
    left: "25%",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
})