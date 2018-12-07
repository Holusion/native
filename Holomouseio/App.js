import {createStackNavigator} from 'react-navigation'
import ObjectScreen from './src/screens/ObjectScreen'
import HomeScreen from './src/screens/HomeScreen';
import ThemeSelectorScreen from './src/screens/ThemeSelectorScreen';
import EndScreen from './src/screens/EndScreen';
import CatalogueScreen from './src/screens/CatalogueScreen';
import { Root } from 'native-base';
import React, { Component } from 'react';
import RemerciementScreen from './src/screens/RemerciementScreen';
import firebase from 'react-native-firebase';

const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: () => ({
      title: "Holomouseio - Accueil",
      headerLeft: null
    })
  },
  Remerciement: {
    screen: RemerciementScreen,
    navigationOptions: () => ({
      title: "Holomouseio - Remerciement"
    })
  },
  Selection: {
    screen: ThemeSelectorScreen,
    navigationOptions: () => ({
      title: "Holomouseio - Sélection"
    })
  },
  Catalogue: {
    screen: CatalogueScreen,
    navigationOptions: () => ({
      title: "Holomouseio - Catalogue"
    })
  },
  Object: {
    screen: ObjectScreen,
    navigationOptions: () => ({
      title: "Holomouseio - Contenus"
    })
  },
  End: {
    screen: EndScreen,
    navigationOptions: () => ({
      title: "Holomouseio - Fin",
      headerLeft: null
    })
  }
})

const ref = firebase.storage().ref();
const dirRef = ref.child('Holomouseio');


export default () => 
  <Root>
    <AppNavigator />
  </Root>
