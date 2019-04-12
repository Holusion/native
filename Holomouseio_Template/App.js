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

const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: ({ navigation }) => customNavigationOptions({isHeader: true, title: "Accueil"}, navigation)
  },
  Remerciement: {
    screen: RemerciementScreen,
    navigationOptions: ({ navigation }) => customNavigationOptions({title: "Remerciements"}, navigation)
  },
  Selection: {
    screen: ThemeSelectorScreen,
    navigationOptions: ({ navigation }) => customNavigationOptions({title: "Sélection"}, navigation)
  },
  Catalogue: {
    screen: CatalogueScreen,
    navigationOptions: ({ navigation }) => customNavigationOptions({title: "Catalogue"}, navigation)
  },
  Object: {
    screen: ObjectScreen,
    navigationOptions: ({ navigation }) => customNavigationOptions({title: "Contenus"}, navigation)
  },
  ObjectRemerciements: {
    screen: ObjectRemerciementsScreen,
    navigationOptions: ({ navigation }) => customNavigationOptions({title: "Remerciements"}, navigation)
  },
});

export default () => 
  <Root>
    <AppNavigator />
  </Root>
