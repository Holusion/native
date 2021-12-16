import React from 'react';
import { Provider } from 'react-redux';

import "react-native-gesture-handler";
import { enableScreens } from 'react-native-screens';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from "@react-navigation/native";


import { Root} from 'native-base';
import { AppState, StatusBar, ActivityIndicator } from "react-native"

import {sagaStore} from "@holusion/cache-control";

import { screens, NetworkIcon, netScan, ThemeProvider, ifRequiredLoaded, ErrorHandler, withErrorHandler } from './lib';
import {ThemeProvider as NewThemeProvider} from "./lib/components/style"


enableScreens();

const Stack = createNativeStackNavigator();

const screenOptions = ({navigation})=>{
  return {
    headerBackTitle: "Retour",
    headerRight: ()=>(<NetworkIcon onPress={() => navigation.navigate("Settings")}/>),
  };
}

const HomeScreen = withErrorHandler(ifRequiredLoaded(screens.HomeScreen));
const ListScreen = withErrorHandler(ifRequiredLoaded(screens.ListScreen));
const ObjectScreen = withErrorHandler(ifRequiredLoaded(screens.ObjectScreen));
const SettingsScreen = withErrorHandler(screens.SettingsScreen);
const NotFoundScreen = withErrorHandler(screens.NotFoundScreen);
const ContactScreen = withErrorHandler(screens.ContactScreen);


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
    this._changeListener = AppState.addEventListener('change', this.onChange);
  }
  componentWillUnmount(){
    if(this._changeListener){
      this._changeListener.remove();
      this._changeListener = null;
    }
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
        <ErrorHandler>
          {this.state.store?<Provider store={this.state.store}>
            <ThemeProvider>
              <NewThemeProvider>
                <NavigationContainer>
                  <Stack.Navigator screenOptions={screenOptions}  initialRouteName="Home">
                    <Stack.Screen name="Home" component={HomeScreen}/>
                    <Stack.Screen name="List" component={ListScreen}/>
                    <Stack.Screen name="Object" options={{ headerShown: false }} component={ObjectScreen}/>
                    <Stack.Screen name="Settings" options={{stackPresentation:"transparentModal"}} component={SettingsScreen}/>
                    <Stack.Screen name="Contact" options={{stackPresentation:"formSheet"}} component={ContactScreen} />
                    <Stack.Screen name="404" component={NotFoundScreen}/>
                  </Stack.Navigator>
                </NavigationContainer>
              </NewThemeProvider>
            </ThemeProvider>
          </Provider> : <ActivityIndicator/>}
        </ErrorHandler>
    </Root>
  }
}
