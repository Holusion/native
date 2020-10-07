import React from 'react';
import { Provider } from 'react-redux';

import "react-native-gesture-handler";

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Root, StyleProvider } from 'native-base';
import { AppState, StatusBar } from "react-native"


import {persistentStore, screens as defaultScreens, components, netScan, DownloadProvider } from '@holusion/react-native-holusion';
const {NetworkIcon} = components;

import getTheme from '@holusion/react-native-holusion/native-base-theme/components';
import getVariables from "./theme.js"

import {name, displayName} from "./package.json";

import HomeScreen from "./lib/screens/HomeScreen";

import SpriteCube from "./lib/components/SpriteCube";

const [store] = persistentStore({
  projectName: "egger", 
});

const variables = getVariables();

function makeTitle(navigation){
  const category  = navigation.getParam("category");
  if(category) return category;
  return displayName;
}

function screenOptions({navigation}){
  return {
    headerRight: ()=><NetworkIcon onPress={() => {navigation.navigate("Connect")}}/>, 
  }
}


const Stack = createStackNavigator();



//*/

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
    this.unsubscribe = netScan(store);
  }
  componentWillUnmount(){
    AppState.removeEventListener('change', this.onChange);
  }

  onChange =  (nextAppState)=>{
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.unsubscribe = netScan(store);
    }else if(this.state.appState == 'active' && nextAppState.match(/inactive|background/)){
      this.unsubscribe();
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
              <Stack.Screen name="Connect" component={defaultScreens.ConnectScreen}/>
              <Stack.Screen name="Object" component={defaultScreens.ObjectScreen}/>
              <Stack.Screen name="Synchronize" component={defaultScreens.SynchronizeScreen}/>
            </Stack.Navigator>
            </NavigationContainer>
        </Provider> 
      </StyleProvider> 
    </Root>
  }
}
