import React from 'react';
import { Provider } from 'react-redux';

import "react-native-gesture-handler";
import { enableScreens } from 'react-native-screens';
enableScreens();

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from "@react-navigation/native";


import { Root, Container, Content, Spinner } from 'native-base';
import { AppState, StatusBar } from "react-native"

import {sagaStore} from "@holusion/cache-control";

import { screens, NetworkIcon, netScan, ThemeProvider, RequiredLoadWrapper } from '@holusion/react-native-holusion';


import ConnectedTitle from "./ConnectedTitle";


const ModalStack = createStackNavigator();
const MainStack = createStackNavigator();

const screenOptions = ({navigation})=>{
  return {
    headerBackTitle: "Retour",
    title: <ConnectedTitle placeholder={require("./assets/logo_holusion.png")} resizeMode='contain' style={{flex:1, height:32}} />,
    headerRight: ()=>(<NetworkIcon onPress={() => navigation.navigate("Settings")}/>),
  };
}

export default class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      showOptions: true,
      appState: AppState.currentState,
    }
  }



  componentDidMount(){
    const [store, task] = sagaStore({defaultProject:"holodemo"});
    this.setState({store, task});
    this.onFocus(store);
    AppState.addEventListener('change', this.onChange);
  }
  componentWillUnmount(){
    AppState.removeEventListener('change', this.onChange);
    if(this.state.task) this.state.task.cancel();
    this.onDefocus();
  }

  onFocus(store){
    this.net_unsubscribe = netScan(store || this.state.store);
  }
  onDefocus(){
    this.net_unsubscribe();
  }

  onChange =  (nextAppState)=>{
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.onFocus();
    }else if(this.state.appState == 'active' && nextAppState.match(/inactive|background/)){
      this.onDefocus();
    }
    this.setState({appState: nextAppState});
  }

  render(){
    return <Root>
       <StatusBar hidden={true} />
        {this.state.store?<Provider store={this.state.store}>
            <ThemeProvider>
              <NavigationContainer>
                <ModalStack.Navigator mode="modal" headerMode= 'none' screenOptions={{headerShown: false, cardStyle: { backgroundColor: 'transparent' },}} initialRouteName="Home">
                  <ModalStack.Screen name="Home" component={Home}/>
                  <ModalStack.Screen name="Settings"  component={screens.SettingsScreen}/>
                </ModalStack.Navigator>
              
              </NavigationContainer>
            </ThemeProvider> 
        </Provider> : <Container><Content><Spinner/></Content></Container>}
    </Root>
  }
}

function Home(){
  return (<RequiredLoadWrapper>
    <MainStack.Navigator mode="card" screenOptions={screenOptions} >
      <MainStack.Screen name="Home" component={screens.HomeScreen}/>
      <MainStack.Screen name="List" component={screens.ListScreen}/>
      <MainStack.Screen name="Connect" component={screens.ConnectScreen}/>
      <MainStack.Screen name="Object" component={screens.ObjectScreen}/>
      <MainStack.Screen name="Synchronize" component={screens.SynchronizeScreen}/>
    </MainStack.Navigator>
  </RequiredLoadWrapper>);
}