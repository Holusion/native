import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from "@react-navigation/native";
import { Root, Icon, Button, Text, StyleProvider, Toast } from 'native-base';
import {AppState, StatusBar, Image} from "react-native"
import React from 'react';
import { Provider, connect} from 'react-redux';

import "react-native-gesture-handler";

import {StoreWrapper, screens, components, strings, netScan } from '@holusion/react-native-holusion';
const {NetworkIcon} = components;

import getTheme from '@holusion/react-native-holusion/native-base-theme/components';
import getVariables from "./theme.js"




const wrapper = new StoreWrapper({projectName:"les_residences_du_terroir"});
const store = wrapper.store;
const variables = getVariables();

function makeHeader({navigation}){
  return <NetworkIcon onPress={() => {navigation.navigate("Connect")}}/>
}
function screenOptions({navigation}){
  return {
    headerBackTitle: "Retour",
    title: <Image source={require("./assets/logo.jpg")} resizeMode='contain' style={{flex:1, height:32}} />,
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
    wrapper.watch(({severity, message})=>{
      Toast.show({
        text: `(${severity}) : ${message}`,
        duration: 4000
      })
    })
    .catch((e)=>{
      console.warn(e.code, e.message);
      Toast.show({
        text: e.message,
        duration: 4000
      })
    })
  }
  onDefocus(){
    this.net_unsubscribe();
    wrapper.unwatch();
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
          <NavigationContainer>
            <Stack.Navigator screenOptions={screenOptions} initialRouteName="Home">
              <Stack.Screen name="Home" component={screens.HomeScreen}/>
              <Stack.Screen name="List" component={screens.ListScreen}/>
              <Stack.Screen name="Connect" component={screens.ConnectScreen}/>
              <Stack.Screen name="Object" component={screens.ObjectScreen}/>
              <Stack.Screen name="Synchronize" component={screens.SynchronizeScreen}/>
            </Stack.Navigator>
            </NavigationContainer>
        </Provider> 
      </StyleProvider> 
    </Root>
  }
}
