import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from "@react-navigation/native";
import { Root, View, StyleProvider, Toast } from 'native-base';
import {AppState, StatusBar, Image} from "react-native"
import React from 'react';
import { Provider, connect} from 'react-redux';

import "react-native-gesture-handler";

import {persistentStore, screens as defaultScreens, components, strings, netScan, DownloadProvider } from '@holusion/react-native-holusion';
const {NetworkIcon} = components;

import getTheme from '@holusion/react-native-holusion/native-base-theme/components';
import getVariables from "./theme.js"

import HomeScreen from "./lib/screens/HomeScreen";
import ListScreen from "./lib/screens/ListScreen";
import ObjectScreen from './lib/screens/ObjectScreen';
const [store] = persistentStore({
  configurableProjectName: true,
  projectName: "ory-nbt", 
});
const variables = getVariables();

function makeHeader({navigation}){
  return <NetworkIcon onPress={() => {navigation.navigate("Connect")}}/>
}

function screenOptions({navigation}){
  return {
    headerBackTitle: "Retour",
    title: <View style={{}}></View>,
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
      <StyleProvider style={getTheme(variables)}>
        <Provider store={store}>
          <DownloadProvider/>
          <NavigationContainer>
            <Stack.Navigator screenOptions={screenOptions} initialRouteName="Home">
              <Stack.Screen name="Home" component={HomeScreen}/>
              <Stack.Screen name="List" component={ListScreen}/>
              <Stack.Screen name="Connect" component={defaultScreens.ConnectScreen}/>
              <Stack.Screen name="Object" component={ObjectScreen}/>
              <Stack.Screen name="Synchronize" component={defaultScreens.SynchronizeScreen}/>
            </Stack.Navigator>
            </NavigationContainer>
        </Provider> 
      </StyleProvider> 
    </Root>
  }
}
