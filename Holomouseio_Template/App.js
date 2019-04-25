import {createStackNavigator} from 'react-navigation'
import ObjectScreen from './src/screens/ObjectScreen'
import HomeScreen from './src/screens/HomeScreen';
import ThemeSelectorScreen from './src/screens/ThemeSelectorScreen';
import ObjectRemerciementsScreen from './src/screens/ObjectRemerciementsScreen';
import CatalogueScreen from './src/screens/CatalogueScreen';
import { Root, Icon } from 'native-base';
import React from 'react';
import RemerciementScreen from './src/screens/RemerciementScreen';

import * as Config from './src/utils/Config';

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

const pushNavigator = (navName, screen, options) => {
  stackNavigator[navName] = {
    screen: screen,
    navigationOptions: ({ navigation }) => customNavigationOptions(options, navigation)
  };
}

pushNavigator(navigator.home, HomeScreen, {isHeader: true, title: strings.navigation.accueil});
pushNavigator(navigator.remerciements, RemerciementScreen, {title: strings.navigation.remerciements});
pushNavigator(navigator.selection, ThemeSelectorScreen, {title: strings.navigation.selection});
pushNavigator(navigator.catalogue, CatalogueScreen, {title: strings.navigation.catalogue});
pushNavigator(navigator.object, ObjectScreen, {title: strings.navigation.contenus});
pushNavigator(navigator.objectRemerciements, ObjectRemerciementsScreen, {title: strings.navigation.remerciements})

const AppNavigator = createStackNavigator(stackNavigator);

export default () => 
  <Root>
    <AppNavigator />
  </Root>
