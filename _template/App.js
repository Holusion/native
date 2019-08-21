import {createStackNavigator, createAppContainer} from 'react-navigation'
import { Root } from 'native-base';
import React from 'react';

import {navigator, TransitionConfiguration} from './navigator'

let stackNavigator = {};

const pushNavigator = (nav) => {
  stackNavigator[nav.id] = {
    screen: nav.screen,
    navigationOptions: ({ navigation }) => nav.options(navigation)
  };
}

for(let nav in navigator) {
  pushNavigator(navigator[nav]);
}

const AppNavigator = createStackNavigator(stackNavigator);
const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return <Root>
      <AppContainer />
    </Root>
  }
}
