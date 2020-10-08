import React from 'react';
import { Provider, connect } from 'react-redux';

import "react-native-gesture-handler";

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from "@react-navigation/native";

import { Root } from 'native-base';
import { AppState, StatusBar } from "react-native"


import {persistentStore, screens, components, netScan, DownloadProvider, ThemeProvider } from '@holusion/react-native-holusion';
const {NetworkIcon} = components;


import ConnectedTitle from "./ConnectedTitle";

const [store] = persistentStore({
  configurableProjectName: true,
  projectName: "holodemo", 
});

function makeHeader({navigation}){
  return <NetworkIcon onPress={() => {navigation.navigate("Connect")}}/>
}

function screenOptions({navigation}){
  return {
    headerBackTitle: "Retour",
    title: <ConnectedTitle placeholder={require("./assets/logo_holusion.png")} resizeMode='contain' style={{flex:1, height:32}} />,
    headerRight: ()=>makeHeader({navigation}),
  };
}



const Stack = createStackNavigator();


export default class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      appState: AppState.currentState,
    }
  }
  componentDidMount(){
    AppState.addEventListener('change', this.onChange);
    //ScreenBrightness.setBrightness(1);
    this.onFocus();
  }
  componentWillUnmount(){
    AppState.removeEventListener('change', this.onChange);
  }
  onFocus(){
    this.net_unsubscribe = netScan(store);
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

  render(){
    return <Root>
       <StatusBar hidden={true} />
        <Provider store={store}>
          <DownloadProvider/>
          <ThemeProvider>
            <NavigationContainer>
              <Stack.Navigator screenOptions={screenOptions} initialRouteName="Home">
                <Stack.Screen name="Home" component={screens.HomeScreen}/>
                <Stack.Screen name="List" component={screens.ListScreen}/>
                <Stack.Screen name="Connect" component={screens.ConnectScreen}/>
                <Stack.Screen name="Object" component={screens.ObjectScreen}/>
                <Stack.Screen name="Synchronize" component={screens.SynchronizeScreen}/>
              </Stack.Navigator>
            </NavigationContainer>
          </ThemeProvider> 
        </Provider> 
    </Root>
  }
}
