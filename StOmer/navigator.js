import React from 'react'

import HomeScreen from "./src/screens/HomeScreen";
import RemerciementScreen from "./src/screens/RemerciementScreen";
import ThemeSelectorScreen from "./src/screens/ThemeSelectorScreen";
import CatalogueScreen from "./src/screens/CatalogueScreen";
import ObjectScreen from "./src/screens/ObjectScreen";
import ObjectRemerciementsScreen from "./src/screens/ObjectRemerciementsScreen";
import SetupScreen from "./src/screens/SetupScreen";

import * as Config from "./Config";

import {Icon} from 'native-base';
import { HeaderBackButton } from 'react-navigation';

const wifiIcon = (navigation) => <Icon style={{marginRight: 16, color: navigation.getParam("color", "red")}} name="ios-wifi"/>;
const titleScreen = (mainTitle) => Config.projectName + " - " + mainTitle;

export const navigator = {
    setup: {
        id: "Setup",
        screen: SetupScreen,
        options: navigation => ({headerLeft: null, headerRight: wifiIcon(navigation), headerBackTitle: "Retour"})
    },
    home: {
        id: "Home",
        screen: HomeScreen,
        options: navigation => ({headerLeft: null, headerRight: wifiIcon(navigation), headerBackTitle: "Retour"})
    },
    remerciements: {
        id: "Remerciements",
        screen: RemerciementScreen,
        options: navigation => ({headerRight: wifiIcon(navigation), headerBackTitle: "Retour"})
    },
    selection: {
        id: "Selection",
        screen: ThemeSelectorScreen,
        options: navigation => ({headerRight: wifiIcon(navigation), headerBackTitle: "Retour"})
    },
    catalogue: {
        id: "Catalogue",
        screen: CatalogueScreen,
        options: navigation => ({headerRight: wifiIcon(navigation), headerBackTitle: "Retour"})
    },
    object: {
        id: "Object",
        screen: ObjectScreen,
        options: navigation => ({headerRight: wifiIcon(navigation), headerLeft: <HeaderBackButton title={"Retour"} backTitleVisible={true} onPress={() => navigation.navigate(navigator.catalogue.id)}/>})
    },
    objectRemerciements: {
        id: "ObjectRemerciements",
        screen: ObjectRemerciementsScreen,
        options: navigation => ({headerRight: wifiIcon(navigation)})
    }
}