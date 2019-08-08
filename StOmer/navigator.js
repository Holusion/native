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

const wifiIcon = (navigation) => <Icon style={{marginRight: 16, color: navigation.getParam("color", "red")}} name="ios-wifi"/>;
const titleScreen = (mainTitle) => Config.projectName + " - " + mainTitle;

export const navigator = {
    setup: {
        id: "Setup",
        screen: SetupScreen,
        options: navigation => ({headerLeft: null, title: titleScreen("Setup"), headerRight: wifiIcon(navigation)})
    },
    home: {
        id: "Home",
        screen: HomeScreen,
        options: navigation => ({headerLeft: null, title: titleScreen("Accueil"), headerRight: wifiIcon(navigation)})
    },
    remerciements: {
        id: "Remerciements",
        screen: RemerciementScreen,
        options: navigation => ({title: titleScreen("Remerciements"), headerRight: wifiIcon(navigation)})
    },
    selection: {
        id: "Selection",
        screen: ThemeSelectorScreen,
        options: navigation => ({title: titleScreen("Sélection"), headerRight: wifiIcon(navigation)})
    },
    catalogue: {
        id: "Catalogue",
        screen: CatalogueScreen,
        options: navigation => ({title: titleScreen("Catalogue"), headerRight: wifiIcon(navigation)})
    },
    object: {
        id: "Object",
        screen: ObjectScreen,
        options: navigation => ({headerRight: wifiIcon(navigation)})
    },
    objectRemerciements: {
        id: "ObjectRemerciements",
        screen: ObjectRemerciementsScreen,
        options: navigation => ({title: titleScreen("Remerciements"), headerRight: wifiIcon(navigation)})
    }
}