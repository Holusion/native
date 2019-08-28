import {createStackNavigator, createAppContainer, NavigationActions} from 'react-navigation'
import { Root } from 'native-base';
import {Button} from "react-native";
import React from 'react';
import { Provider} from 'react-redux'

import store from './src/store'
import HomeScreen from "./src/screens/HomeScreen";

import {navigator, TransitionConfiguration} from './navigator'

import Network from "./Network";
import * as strings from "./strings.json";


const navigator = {
  home: {
    screen: HomeScreen,
    navigationOptions: (navigation)=>{
      return {}
    }
  }
}

const navigationOptions = {
  defaultNavigationOptions:{
    gesturesEnabled: false,
    headerLeft: null,
    headerStyle: {height: 24, display: 'flex'}, 
    headerRight: <Button onPress={NavigationActions.navigate("Connect")} title="Connect"/>, 
    headerBackTitle: strings.back
  }
}

const AppNavigator = createStackNavigator(navigator, navigationOptions);
const AppContainer = createAppContainer(AppNavigator);


export default function App(props){
  return <Root>
    <Provider store={store}>
      <Network/>
      <AppContainer />      
    </Provider>
  </Root>
}
