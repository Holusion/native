'use strict';
import React, { useEffect, useState, useRef } from 'react';
import { Keyboard, PanResponder } from 'react-native';
import { Provider, connect } from 'react-redux';

import "react-native-gesture-handler";
import { enableScreens } from 'react-native-screens';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DefaultTheme, NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";



import { AppState, StatusBar, ActivityIndicator, View, Button, StyleSheet, Text } from "react-native"

import {sagaStore} from "@holusion/cache-control";

import { screens, NetworkIcon, netScan, ifRequiredLoaded, ErrorHandler, withErrorHandler } from './lib';
import {H1, H2, ThemeProvider} from "./lib/components/style"


enableScreens();

const Stack = createNativeStackNavigator();

const screenOptions = ({navigation})=>{
  return {
    headerBackTitle: "Retour",
    headerRight: ()=>(<NetworkIcon onPress={() => navigation.navigate("Settings")}/>),
  };
}

const HomeScreen = withErrorHandler(ifRequiredLoaded(screens.HomeScreen));
const ListScreen = withErrorHandler(ifRequiredLoaded(screens.ListScreen));
const ObjectScreen = withErrorHandler(ifRequiredLoaded(screens.ObjectScreen));
const SettingsScreen = withErrorHandler(screens.SettingsScreen);
const NotFoundScreen = withErrorHandler(screens.NotFoundScreen);
//const ContactScreen = withErrorHandler(screens.ContactScreen);



class ConfiguredApp extends React.Component{
  #navRef;
  #timeout;
  #listeners = [];
  panResponder = PanResponder.create({
    // Ask to be the responder:
    onStartShouldSetPanResponder: (evt, gestureState) => {
      this.onUserActivity();
      return false
    },
  });

  constructor(props){
    super(props);
    this.state = {notFound: null};
    this.#navRef = React.createRef();
  }
  componentDidMount(){
    this.#listeners.push(
      Keyboard.addListener('keyboardDidHide', this.onUserActivity),
      Keyboard.addListener('keyboardDidShow', this.onUserActivity),
    );
  }

  componentWillUnmount(){
    for(let l of this.#listeners){
      l.remove();
    }
    this.#listeners = [];
  }

  onUserActivity = ()=>{
    clearTimeout(this.#timeout);
    if(typeof this.props.conf.timeout !== "number" || this.props.conf.timeout <= 0) return;
    this.#timeout = setTimeout(()=>{
      if(!this.#navRef?.current) return;
      if(! this.#navRef.current.canGoBack()) return;
      let current = this.#navRef.current.getState().routes;
      if(current.slice(-1)[0].name == "Settings") return;
      console.log("Route : ", current[0].state.routes);
      let route = (current[0].name === "Object"? {
        ...current[0],
        stale: true,
        state: {
          routes: [current[0].state.routes[0]]
        }
      }: current[0]);
      this.#navRef.current.resetRoot({
        index: 0,
        routes: [route],
      });
    }, this.props.conf.timeout);
  }

  handle404 = ({payload, type})=>{
    let message = `The action '${type}'${
      payload ? ` with payload ${JSON.stringify(payload)}` : ''
    } was not handled by any navigator.`;
    console.warn(message);
    switch(type){
      case "NAVIGATE":
        message = `Pas de page nommée '${payload.name}${payload?.params?.id?"/"+payload.params.id:""}'`;
        break;
    }
    this.setState({notFound:{type, message}});
  };

  render(){
    let notFoundModal = (this.state.notFound?(<View style={styles.modalView}>
      <H1 style={{padding: 15}}>Page non trouvée</H1>
      <H2>Action : {this.state.notFound.type}</H2>
      <Text style={{fontSize: 22, padding: 10}}>{this.state.notFound.message}</Text>
      <Button title="Retour" style={{padding: 15}}onPress={()=>setNotFound(null)}/>
    </View>): null);
  
    if(!this.props.conf){
      //Don't try to render if state is not yet initialized
      return null;
    }
    return (<View {...this.panResponder.panHandlers} style={{flex: 1}}>
      <NavigationContainer 
        ref={this.#navRef} onStateChange={this.onUserActivity}
        onUnhandledAction={this.handle404} 
        theme={{...DefaultTheme,colors: {...DefaultTheme.colors, background : 'white'}}}
      >
        <Stack.Navigator onStateChange={this.onUserActivity} screenOptions={screenOptions}  initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen}/>
          <Stack.Screen name="List" component={ListScreen}/>
          <Stack.Screen name="Object" options={{ headerShown: false }} component={ObjectScreen}/>
          <Stack.Screen name="Settings" options={{presentation:"transparentModal", headerShown: false}} component={SettingsScreen}/>
          {/*<Stack.Screen name="Contact" options={{stackPresentation:"formSheet"}} component={ContactScreen} />*/}
        </Stack.Navigator>
      </NavigationContainer>
      {notFoundModal}
    </View>);
  }
}



function mapStateToProps(state) {
  const { conf } = state;
  return {
    conf,
  };
}

const ConnectedConfiguredApp = connect(mapStateToProps, { })(ConfiguredApp);


export default class App extends React.Component{
  #timeout;
  #navRef;
  #listeners = [];


  constructor(props){
    super(props);
    this.state = {
      showOptions: true,
      appState: AppState.currentState,
      notFound: null
    }
    this.#navRef = React.createRef();
  }


  componentDidMount(){
    const [store, task] = sagaStore({projectName: "holodemo"});
    this.setState({store, task});
    this.onFocus(store);
    this.#listeners.push(
      AppState.addEventListener('change', this.onChange),
    )
  }

  componentWillUnmount(){
    for(let l of this.#listeners){
      l.remove();
    }
    this.#listeners = [];

    if(this.state.task) this.state.task.cancel();
    this.onDefocus();
  }

  onFocus(store){
    this.net_unsubscribe = netScan(store || this.state.store);
  }

  onDefocus(){
    this.net_unsubscribe();
  }

  onChange =  (nextAppState)=>{
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.onFocus();
    }else if(this.state.appState == 'active' && nextAppState.match(/inactive|background/)){
      this.onDefocus();
    }
    this.setState({appState: nextAppState});
  }


  handle404 = ({payload, type})=>{
    let message = `The action '${type}'${
      payload ? ` with payload ${JSON.stringify(payload)}` : ''
    } was not handled by any navigator.`;
    console.warn(message);
    switch(type){
      case "NAVIGATE":
        message = `Pas de page nommée '${payload.name}${payload?.params?.id?"/"+payload.params.id:""}'`;
        break;
    }
    this.setState({notFound: {type, message}});
  }

  render(){
    //ObjectLink is supposed to handle this. However we still want eventual errors to bubble up.
    
    return <React.Fragment >
       <StatusBar hidden={true} />
        <ErrorHandler>
          {this.state.store?<Provider store={this.state.store}>
            <ThemeProvider>
              <ConnectedConfiguredApp/>
            </ThemeProvider>
          </Provider> : <ActivityIndicator/>}
        </ErrorHandler>
    </React.Fragment>
  }
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