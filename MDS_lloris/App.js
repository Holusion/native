import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer, NavigationActions} from "react-navigation";
import { Root, Icon, Button, Text, Title, StyleProvider } from 'native-base';
import {AppState, StatusBar, Image} from "react-native"
import React from 'react';
import { Provider, connect} from 'react-redux';

import UserInactivity from 'react-native-user-inactivity';


import {configureStore, screens, components, strings, netScan } from '@holusion/react-native-holusion';

const {NetworkIcon} = components;

import getTheme from '@holusion/react-native-holusion/native-base-theme/components';
import getVariables from "./theme.js"

import {name, displayName} from "./package.json";


import {objectScreenVithView} from "@holusion/react-native-holusion/lib/screens/ObjectScreen";

import QuestionScreen from "./lib/screens/QuestionScreen";
import HomeScreen from "./lib/screens/HomeScreen";
import ListScreen from "./lib/screens/ListScreen";
import ObjectScreen from "./lib/screens/ObjectScreen"
import ConnectScreen from "./lib/screens/ConnectScreen";

const store = configureStore({projectName:name, userName: "user@dev.holusion.net", password: "KsrVjGDm"});

const variables = getVariables();

function makeTitle(navigation){
  const category  = navigation.getParam("category");
  if(category) return category;
  return displayName;
}

function navigationOptions({navigation}){
  return {
    headerRight: <NetworkIcon onPress={() => {navigation.navigate("Connect")}} colors={{on:"#034EA2FF", off: "red"}}/>, 
  }
}

function headerTitle(txt){
  return (<Title style={{color:"white", fontSize:30, marginTop: -8, fontFamily: "Oswald"}}>{txt}</Title>)
}

const default_navigation = screens.getDefaultNavigator({navigationOptions});
const navigation = {
  Home: {
    screen: HomeScreen,
    navigationOptions: navigation=> Object.assign(navigationOptions(navigation), {headerTitle: headerTitle("SOUHAITEZ-VOUS POSER UNE QUESTION A HUGO LLORIS?")}),
  },
  Update: default_navigation.Update,
  Synchronize: default_navigation.Synchronize,
  Connect: {
    screen: ConnectScreen,
    navigationOptions,
  },
  List: {
    screen: ListScreen,
    navigationOptions: navigation=> Object.assign(navigationOptions(navigation), {headerTitle: headerTitle("CHOISISSEZ LE THEME DE VOTRE QUESTION")}),
  },
  Object: {
    screen: ObjectScreen,
    navigationOptions: navigation=> Object.assign(navigationOptions(navigation), {headerTitle: null, headerStyle:{backgroundColor: 'transparent'}}),
  },
  Question: {
    screen: QuestionScreen,
    navigationOptions,
  },
}


const options = {
  defaultNavigationOptions:{
    gesturesEnabled: false,
    headerTransparent: true,
    headerStyle: {
      backgroundColor: 'black',
      zIndex: 100,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
    },
    headerTitle: null,
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
          </UserInactivity>
        </Provider> 
      </StyleProvider> 
    </Root>
  }
}
