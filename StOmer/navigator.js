import React from 'react'

import HomeScreen from "./src/screens/HomeScreen";
import RemerciementScreen from "./src/screens/RemerciementScreen";
import ThemeSelectorScreen from "./src/screens/ThemeSelectorScreen";
import CatalogueScreen from "./src/screens/CatalogueScreen";
import ObjectScreen from "./src/screens/ObjectScreen";
import ObjectRemerciementsScreen from "./src/screens/ObjectRemerciementsScreen";
import SetupScreen from "./src/screens/SetupScreen";

import * as strings from "./strings.json";

import {Icon} from 'native-base';
import { HeaderBackButton } from 'react-navigation';

const wifiIcon = (navigation) => <Icon style={{marginRight: 16, color: navigation.getParam("color", "red")}} name="ios-wifi"/>;
const headerStyle = {height: 24, display: 'flex'}
const iconStyle = {top: -8}

export const navigator = {
    setup: {
        id: "Setup",
        screen: SetupScreen,
        options: navigation => ({headerLeft: null, headerStyle: headerStyle, headerRightContainerStyle: iconStyle, headerRight: wifiIcon(navigation), headerBackTitle: strings.back})
    },
    home: {
        id: "Home",
        screen: HomeScreen,
        options: navigation => ({headerLeft: null, headerStyle: headerStyle, headerRightContainerStyle: iconStyle, headerRight: wifiIcon(navigation), headerBackTitle: strings.back})
    },
    remerciements: {
        id: "Remerciements",
        screen: RemerciementScreen,
        options: navigation => ({headerStyle: headerStyle, headerRightContainerStyle: iconStyle, headerLeftContainerStyle: iconStyle, headerRight: wifiIcon(navigation), headerBackTitle: strings.back})
    },
    selection: {
        id: "Selection",
        screen: ThemeSelectorScreen,
        options: navigation => ({headerStyle: headerStyle, headerRightContainerStyle: iconStyle, headerLeftContainerStyle: iconStyle, headerRight: wifiIcon(navigation), headerBackTitle: strings.back})
    },
    catalogue: {
        id: "Catalogue",
        screen: CatalogueScreen,
        options: navigation => ({headerStyle: headerStyle, headerRightContainerStyle: iconStyle, headerLeftContainerStyle: iconStyle, headerRight: wifiIcon(navigation), headerBackTitle: strings.back})
    },
    object: {
        id: "Object",
        screen: ObjectScreen,
        options: navigation => ({headerStyle: headerStyle, headerRightContainerStyle: iconStyle, headerLeftContainerStyle: iconStyle, headerRight: wifiIcon(navigation), headerLeft: <HeaderBackButton title={strings.back} backTitleVisible={true} onPress={() => navigation.navigate(navigator.catalogue.id)}/>})
    },
    objectRemerciements: {
        id: "ObjectRemerciements",
        screen: ObjectRemerciementsScreen,
        options: navigation => ({headerRight: wifiIcon(navigation), headerStyle: headerStyle, headerRightContainerStyle: iconStyle, headerLeftContainerStyle: iconStyle, headerBackTitle: strings.back})
    }
}