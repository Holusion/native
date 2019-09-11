import {createStackNavigator, createAppContainer} from 'react-navigation'
import { Root, Icon, Button, Text, StyleProvider } from 'native-base';
import {AppState} from "react-native"
import React from 'react';
import { Provider, connect} from 'react-redux';

import {configureStore, screens, strings, netScan } from '@holusion/react-native-holusion';
const {HomeScreen, ConnectScreen, UpdateScreen, ObjectScreen, SynchronizeScreen} = screens;


import getTheme from './native-base-theme/components';


import {name} from "./package.json";

const store = configureStore({name});

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


export default class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      appState: AppState.currentState,
    }
  }
  componentDidMount(){
    AppState.addEventListener('change', this.onChange);
    this.unsubscribe = netScan(store);
  }
  componentWillUnmount(){
    AppState.removeEventListener('change', this.onChange);
  }

  onChange =  (nextAppState)=>{
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.unsubscribe = netScan(store);
    }else if(this.state.appState == 'active' && nextAppState.match(/inactive|background/)){
      this.unsubscribe();
    }
    this.setState({appState: nextAppState});
  }
  render(){
    return <Root>
      <StyleProvider style={getTheme(/*use default platform theme*/)}>
        <Provider store={store}>
            <AppContainer />
        </Provider> 
      </StyleProvider> 
    </Root>
  }
}
