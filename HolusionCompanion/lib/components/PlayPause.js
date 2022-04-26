'use strict';
import React, {useContext} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {StyleSheet, Animated, Easing, TouchableOpacity } from "react-native"

import { ThemeContext } from './style';


import {delay} from "../time";

const AnimatedButton = Animated.createAnimatedComponent(TouchableOpacity);

function useThemedPlayPause(){
    const theme = useContext(ThemeContext);

    return{icon: {
      color: theme.color.primary,
    }}
}

export default function PlayPause(props){
    const themeStyle = useThemedPlayPause();

    const grow = new Animated.Value(0);
    let last_request = Promise.resolve();

    function onPressIn(){
        pause();
        grow.setValue(0)
        Animated.timing(
            grow,
            {
              toValue: 1,
              duration: 100,
              easing: Easing.linear,
              useNativeDriver: true,
            }
          ).start()
    }
    function onPressOut(){
        pause();
        grow.setValue(1);
        Animated.timing(
            grow,
            {
              toValue: 0,
              duration: 100,
              easing: Easing.linear,
              useNativeDriver: true,
            }
          ).start()
    }
    function pause(){
        last_request = last_request
        .then(()=> fetch(`http://${props.target.url}/control/pause`, {method:"POST"}))
        .then(()=>delay(120))
        .catch((e)=>{console.log("Pause error : ", e)});
    }

    return (<AnimatedButton key="ctrl" onPressIn={onPressIn} onPressOut={onPressOut} large style={{
        transform:[{scale: 1}],
        zIndex:2,
        padding:5,
        borderRadius:45,
    }} >
        <Icon large primary type="Ionicons" name="pause" style={[controllerTheme.icon, themeStyle.icon]} />
    </AnimatedButton>)
}

const controllerTheme = StyleSheet.create({
    icon:{
        fontSize: 40,
    },
})