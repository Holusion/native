import {createStackNavigator} from 'react-navigation'
import { Root, Icon } from 'native-base';
import React from 'react';

import * as Config from './Config';

import {navigator} from './navigator'

let stackNavigator = {};

const wifiIcon = (navigation) => <Icon style={{marginRight: 16, color: navigation.getParam("color", "red")}} name="ios-wifi"/>;
const titleScreen = (mainTitle) => Config.projectName + " - " + mainTitle;

const customNavigationOptions = (options, navigation) => {
  let obj = {
    title: titleScreen(options.title),
    headerRight: wifiIcon(navigation)
  }
  
  if(options.isHeader) {
    obj = Object.assign(obj, {headerLeft: null})
  }
  
  return obj
}

const pushNavigator = (nav) => {
  stackNavigator[nav.id] = {
    screen: nav.screen,
    navigationOptions: ({ navigation }) => customNavigationOptions(nav.options, navigation)
  };
}

for(let nav in navigator) {
  pushNavigator(navigator[nav]);
}

const AppNavigator = createStackNavigator(stackNavigator);

export default () => 
  <Root>
    <AppNavigator />
  </Root>
