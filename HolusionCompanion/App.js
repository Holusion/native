import React from 'react';
import { Provider } from 'react-redux';

import "react-native-gesture-handler";
import { enableScreens } from 'react-native-screens';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { NavigationContainer } from "@react-navigation/native";


import { Root, Container, Content, Spinner } from 'native-base';
import { AppState, StatusBar } from "react-native"

import {sagaStore} from "@holusion/cache-control";

import { screens, NetworkIcon, netScan, ThemeProvider, RequiredLoadWrapper } from '@holusion/react-native-holusion';



enableScreens();

const Stack = createNativeStackNavigator();

const screenOptions = ({navigation})=>{
  return {
    headerBackTitle: "Retour",
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
                <Stack.Navigator screenOptions={screenOptions}  initialRouteName="Home">
                  <Stack.Screen name="Home" component={screens.HomeScreen}/>
                  <Stack.Screen name="List" component={screens.ListScreen}/>
                  <Stack.Screen name="Connect" component={screens.ConnectScreen}/>
                  <Stack.Screen name="Object" options={{ headerShown: false }} component={screens.ObjectScreen}/>
                  <Stack.Screen name="Synchronize" component={screens.SynchronizeScreen}/>
                  <Stack.Screen name="Settings" options={{stackPresentation:"transparentModal"}} component={screens.SettingsScreen}/>
                  <Stack.Screen name="Contact" options={{stackPresentation:"formSheet"}} component={screens.ContactScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </ThemeProvider> 
        </Provider> : <Container><Content><Spinner/></Content></Container>}
    </Root>
  }
}

function Home(){
  return (<RequiredLoadWrapper>
    <Stack.Navigator mode="card" screenOptions={screenOptions} >
    </Stack.Navigator>
  </RequiredLoadWrapper>);
}