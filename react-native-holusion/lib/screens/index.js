'use strict';
import HomeScreen from "./HomeScreen";
import ConnectScreen from "./ConnectScreen";
import ObjectScreen from "./ObjectScreen";
import SynchronizeScreen from "./SynchronizeScreen";
import UpdateScreen from "./UpdateScreen";
import ListScreen from "./ListScreen";
import AboutScreen from "./AboutScreen";

function getDefaultNavigator({navigationOptions}){
    return {
      Home: {
        screen: HomeScreen,
        navigationOptions,
      },
      Connect: {
        screen: ConnectScreen,
        navigationOptions,
      },
      Update: {
        screen: UpdateScreen,
        navigationOptions,
      },
      Object: {
        screen: ObjectScreen,
        navigationOptions,
      },
      Synchronize: {
        screen:SynchronizeScreen,
        navigationOptions,
      },
      List: {
        screen: ListScreen,
        navigationOptions,
      },
      About: {
          screen: AboutScreen,
          navigationOptions,
      }
    }
}

export {
    HomeScreen,
    ConnectScreen,
    ObjectScreen,
    SynchronizeScreen,
    UpdateScreen,
    ListScreen,
    AboutScreen,

    getDefaultNavigator,
}