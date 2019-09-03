import {createStackNavigator, createAppContainer} from 'react-navigation'
import { Root, Icon, Button, Text, StyleProvider } from 'native-base';
import React from 'react';
import { Provider, connect} from 'react-redux'

import store from './src/store'
import HomeScreen from "./src/screens/HomeScreen";
import ConnectScreen from "./src/screens/ConnectScreen";
import UpdateScreen from "./src/screens/UpdateScreen";
import ObjectScreen from "./src/screens/ObjectScreen";
import SynchronizeScreen from "./src/screens/SynchronizeScreen";
import {navigator, TransitionConfiguration} from './navigator'



import getTheme from './native-base-theme/components';

import Network from "./Network";
import * as strings from "./strings.json";

function navigationOptions({navigation}){
  return {
    title: navigation.routeName,
    headerRight: <NetIcon onPress={() => {navigation.navigate("Connect")}}/>, 
  }
}

const navigation = {
  Home: {
    screen: HomeScreen,
    navigationOptions,
  },
  Connect:{
    screen: ConnectScreen,
    navigationOptions,
  },
  Update:{
    screen: UpdateScreen,
    navigationOptions,
  },
  Object:{
    screen: ObjectScreen,
    navigationOptions,
  },
  Synchronize:{
    screen:SynchronizeScreen,
    navigationOptions,
  }
}

class NetworkIcon extends React.Component{
  constructor(props){
    super(props);
  }
  render(){
    return (<Button transparent onPress={this.props.onPress}><Icon style={{marginRight: 16, color: this.props.connected?"green": "red"}} name="ios-wifi" /></Button>);
  }
}

function mapStateToProps(state){
  const {products} = state;
  return {
    connected: products.find(p => p.active == true)?true: false
  }
}

const NetIcon = connect(mapStateToProps)(NetworkIcon);

const options = {
  defaultNavigationOptions:{
    gesturesEnabled: false,
    headerStyle: {height: 34, display: 'flex'}, 
    headerBackTitle: strings.back
  }
}

const AppNavigator = createStackNavigator(navigation, options);
const AppContainer = createAppContainer(AppNavigator);


export default function App(props){
  return <Root>
    <StyleProvider style={getTheme(/*use default platform theme*/)}>
      <Provider store={store}>
          <Network/>
          <AppContainer />
      </Provider> 
    </StyleProvider> 
  </Root>
}
