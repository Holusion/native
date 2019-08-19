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
import { Easing, Animated } from 'react-native';

const wifiIcon = (navigation) => <Icon style={{marginRight: 16, color: navigation.getParam("color", "red")}} name="ios-wifi"/>;
const headerStyle = {height: 24, display: 'flex'}
const iconStyle = {top: -8}

const slideFromRight = (index, position, width) => {
    const inputRange = [index - 1, index];
    const translateX = position.interpolate({
        inputRange: inputRange,
        outputRange: [width, 0]
    })
    return {transform: [{translateX}]}
}

const slideFromLeft = (index, position, width) => {
    const inputRange = [index - 1, index];
    const translateX = position.interpolate({
        inputRange: inputRange,
        outputRange: [-width, 0]
    })
    return {transform: [{translateX}]}
}

export const TransitionConfiguration = () => {
    return {
        transitionSpec: {
            duration: 750,
            easing: Easing.out(Easing.poly(4)),
            timing: Animated.timing,
            useNativeDriver: true
        },
        screenInterpolator: (sceneProps) => {
            const {layout, position, scene} = sceneProps;
            const width = layout.initWidth;
            const {index, route} = scene;
            const params = route.params || {};
            const transition = params.transition || "default";
            return {
                default: slideFromRight(index, position, width),
                slideLeft: slideFromLeft(index, position, width)
            }[transition];
        }
    }
}

export const navigator = {
    setup: {
        id: "Setup",
        screen: SetupScreen,
        options: navigation => ({gesturesEnabled: false, headerLeft: null, headerStyle: headerStyle, headerRightContainerStyle: iconStyle, headerRight: wifiIcon(navigation), headerBackTitle: strings.back})
    },
    home: {
        id: "Home",
        screen: HomeScreen,
        options: navigation => ({gesturesEnabled: false, headerLeft: null, headerStyle: headerStyle, headerRightContainerStyle: iconStyle, headerRight: wifiIcon(navigation), headerBackTitle: strings.back})
    },
    remerciements: {
        id: "Remerciements",
        screen: RemerciementScreen,
        options: navigation => ({gesturesEnabled: false, headerStyle: headerStyle, headerRightContainerStyle: iconStyle, headerLeftContainerStyle: iconStyle, headerRight: wifiIcon(navigation), headerBackTitle: strings.back})
    },
    selection: {
        id: "Selection",
        screen: ThemeSelectorScreen,
        options: navigation => ({gesturesEnabled: false, headerStyle: headerStyle, headerRightContainerStyle: iconStyle, headerLeftContainerStyle: iconStyle, headerRight: wifiIcon(navigation), headerBackTitle: strings.back})
    },
    catalogue: {
        id: "Catalogue",
        screen: CatalogueScreen,
        options: navigation => ({gesturesEnabled: false, headerStyle: headerStyle, headerRightContainerStyle: iconStyle, headerLeftContainerStyle: iconStyle, headerRight: wifiIcon(navigation), headerBackTitle: strings.back})
    },
    object: {
        id: "Object",
        screen: ObjectScreen,
        options: navigation => ({gesturesEnabled: false, headerStyle: headerStyle, headerRightContainerStyle: iconStyle, headerLeftContainerStyle: iconStyle, headerRight: wifiIcon(navigation), headerLeft: <HeaderBackButton title={strings.back} backTitleVisible={true} onPress={() => navigation.navigate(navigator.catalogue.id)}/>})
    },
    objectRemerciements: {
        id: "ObjectRemerciements",
        screen: ObjectRemerciementsScreen,
        options: navigation => ({gesturesEnabled: false, headerRight: wifiIcon(navigation), headerStyle: headerStyle, headerRightContainerStyle: iconStyle, headerLeftContainerStyle: iconStyle, headerBackTitle: strings.back})
    }
}