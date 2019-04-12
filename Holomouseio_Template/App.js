import {createStackNavigator} from 'react-navigation'
import ObjectScreen from './src/screens/ObjectScreen'
import HomeScreen from './src/screens/HomeScreen';
import ThemeSelectorScreen from './src/screens/ThemeSelectorScreen';
import EndScreen from './src/screens/EndScreen';
import CatalogueScreen from './src/screens/CatalogueScreen';
import { Root, Icon } from 'native-base';
import React from 'react';
import RemerciementScreen from './src/screens/RemerciementScreen';

import * as Config from './src/utils/Config';

const wifiIcon = (navigation) => <Icon style={{marginRight: 16, color: navigation.getParam("color", "red")}} name="ios-wifi"/>;
const titleScreen = (mainTitle) => Config.projectName + " - " + mainTitle;

const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: ({navigation}) => ({
      title: titleScreen("Accueil"),
      headerLeft: null,
      headerRight: wifiIcon(navigation)
    })
  },
  Remerciement: {
    screen: RemerciementScreen,
    navigationOptions: ({navigation}) => ({
      title: titleScreen("Remerciements"),
      headerRight: wifiIcon(navigation)
    })
  },
  Selection: {
    screen: ThemeSelectorScreen,
    navigationOptions: ({navigation}) => ({
      title: titleScreen("Sélection"),
      headerRight: wifiIcon(navigation)
    })
  },
  Catalogue: {
    screen: CatalogueScreen,
    navigationOptions: ({navigation}) => ({
      title: titleScreen("Catalogue"),
      headerRight: wifiIcon(navigation)
    })
  },
  Object: {
    screen: ObjectScreen,
    navigationOptions: ({navigation}) => ({
      title: titleScreen("Contenus"),
      headerRight: wifiIcon(navigation)
    })
  },
  End: {
    screen: EndScreen,
    navigationOptions: ({navigation}) => ({
      title: titleScreen("Remerciements"),
      headerRight: wifiIcon(navigation)
    })
  },
});

export default () => 
  <Root>
    <AppNavigator />
  </Root>
