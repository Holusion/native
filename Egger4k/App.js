import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer, NavigationActions} from "react-navigation";
import { Root, Icon, Button, Text, StyleProvider } from 'native-base';
import {AppState, StatusBar, Image} from "react-native"
import React from 'react';
import { Provider, connect} from 'react-redux';

import UserInactivity from 'react-native-user-inactivity';


import {configureStore, screens, components, strings, netScan } from '@holusion/react-native-holusion';

const {NetworkIcon} = components;

import getTheme from '@holusion/react-native-holusion/native-base-theme/components';
import getVariables from "./theme.js"

import HomeScreen from "./lib/screens/HomeScreen";
import GroupViewScreen from "./lib/screens/GroupViewScreen";
import {name, displayName} from "./package.json";




import SpriteCube from "./lib/components/SpriteCube";

const store = configureStore({projectName:name});

const variables = getVariables();

function makeTitle(navigation){
  const category  = navigation.getParam("category");
  if(category) return category;
  return displayName;
}

function navigationOptions({navigation}){
  return {
    headerRight: <NetworkIcon onPress={() => {navigation.navigate("Connect")}}/>, 
  }
}

const default_navigation = screens.getDefaultNavigator({navigationOptions});
const navigation = {
  Home:{
    screen: HomeScreen,
    navigationOptions,
  },
  Update: default_navigation.Update,
  Synchronize: default_navigation.Synchronize,
  Connect: default_navigation.Connect,
  GroupView: {
    screen: GroupViewScreen,
    navigationOptions,
  }
}


const options = {
  defaultNavigationOptions:{
    gesturesEnabled: false,
    headerStyle: {height: 34, display: 'flex'}, 
    headerTitle: (<Image source={require("./assets/logo_long.jpg")} resizeMode='contain' style={{height:33, position:"absolute", top:-1, padding: 0}}></Image>),
    headerBackTitle: "Retour",
  }
}

const AppNavigator = createStackNavigator(navigation, options);
const AppContainer = createAppContainer(AppNavigator);


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
  onInactive = (status)=>{
    let activeRoute = this._navigator.state.nav.routes.slice(-1)[0].routeName
    if(status){
      //ScreenBrightness.setBrightness(0.4);
    }else if(["Synchronize", "Update", "Connect"].indexOf(activeRoute) == -1){
      //ScreenBrightness.setBrightness(1);
      this._navigator.dispatch(NavigationActions.navigate({
        routeName:"Home",
        params:{},
      }))
    }
   
    
    //*/
  }
  render(){
    return <Root>
       <StatusBar hidden={true} />
      <StyleProvider style={getTheme(variables)}>
        <Provider store={store}>
          <UserInactivity timeForInactivity={120000} onAction={this.onInactive}>
            <AppContainer ref={navigatorRef => {this._navigator=navigatorRef}}/>
            <SpriteCube />
          </UserInactivity>
        </Provider> 
      </StyleProvider> 
    </Root>
  }
}
