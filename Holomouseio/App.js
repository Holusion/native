import {createStackNavigator} from 'react-navigation'
import ObjectScreen from './src/screens/ObjectScreen'
import HomeScreen from './src/screens/HomeScreen';
import ThemeSelectorScreen from './src/screens/ThemeSelectorScreen';
import EndScreen from './src/screens/EndScreen';
import CatalogueScreen from './src/screens/CatalogueScreen';
import { Root } from 'native-base';
import React, { Component } from 'react';
import RemerciementScreen from './src/screens/RemerciementScreen';

import * as Config from './src/utils/Config';

const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: () => ({
      title: Config.projectName + " - Accueil",
      headerLeft: null
    })
  },
  Remerciement: {
    screen: RemerciementScreen,
    navigationOptions: () => ({
      title: Config.projectName + " - Remerciement"
    })
  },
  Selection: {
    screen: ThemeSelectorScreen,
    navigationOptions: () => ({
      title: Config.projectName + " - Sélection"
    })
  },
  Catalogue: {
    screen: CatalogueScreen,
    navigationOptions: () => ({
      title: Config.projectName + " - Catalogue"
    })
  },
  Object: {
    screen: ObjectScreen,
    navigationOptions: () => ({
      title: Config.projectName + " - Contenus"
    })
  },
  End: {
    screen: EndScreen,
    navigationOptions: () => ({
      title: Config.projectName + " - Remerciement",
    })
  }
})

export default () => 
  <Root>
    <AppNavigator />
  </Root>
