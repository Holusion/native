import {createStackNavigator} from 'react-navigation'
import ObjectScreen from './src/screens/ObjectScreen'
import HomeScreen from './src/screens/HomeScreen';
import ThemeSelectorScreen from './src/screens/ThemeSelectorScreen';
import ObjectRemerciementsScreen from './src/screens/ObjectRemerciementsScreen';
import CatalogueScreen from './src/screens/CatalogueScreen';
import { Root, Icon } from 'native-base';
import React from 'react';
import RemerciementScreen from './src/screens/RemerciementScreen';

import * as Config from './Config';

import * as strings from './strings.json';
import * as navigator from './navigator.json'

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

const pushNavigator = (navigator, screen) => {
  stackNavigator[navigator.id] = {
    screen: screen,
    navigationOptions: ({ navigation }) => customNavigationOptions(navigator.options, navigation)
  };
}

pushNavigator(navigator.home, HomeScreen);
pushNavigator(navigator.remerciements, RemerciementScreen);
pushNavigator(navigator.selection, ThemeSelectorScreen);
pushNavigator(navigator.catalogue, CatalogueScreen);
pushNavigator(navigator.object, ObjectScreen);
pushNavigator(navigator.objectRemerciements, ObjectRemerciementsScreen)

const AppNavigator = createStackNavigator(stackNavigator);

export default () => 
  <Root>
    <AppNavigator />
  </Root>
