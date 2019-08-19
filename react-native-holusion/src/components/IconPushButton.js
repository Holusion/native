import React, {useEffect, useState} from 'react';

import {TouchableOpacity, Animated, TouchableWithoutFeedback} from 'react-native';
import { Icon, connectStyle } from 'native-base';

import * as Config from '../../Config'

function handleOnPressIn(setPress, func) {
    setPress(true);
    if(func) {
        func();
    }
}

function handleOnPressOut(setPress, func) {
    setPress(false);
    if(func) {
        func();
    }
}

function IconPushButton(props) {
    const [animation, setAnimation] = useState(new Animated.Value(0));
    const [press, setPress] = useState(false);
    const styles = props.style;
    
    useEffect(() => {
        Animated.timing(animation, {
            toValue: press ? 1 : 0,
            duration: 300
        }).start();
    }, [press])

    return (
        <TouchableWithoutFeedback onPressIn={() => handleOnPressIn(setPress, props.onPressIn)} onPressOut={() => handleOnPressOut(setPress, props.onPressOut)}>
            <Animated.View style={{...styles.button, 
                borderWidth: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 10]
                }),
                width: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [styles.button.width, styles.button.width + 10]
                }),
                height: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [styles.button.height, styles.button.height + 10]
                }),
                borderRadius: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [styles.button.width / 2, (styles.button.width + 10) / 2]
                })
            }}>
                    <Icon type={props.type} style={styles.icon} name={props.name} />
            </Animated.View>
        </TouchableWithoutFeedback>
    )
}

const styles = {
    button: {
        backgroundColor: Config.primaryColor,
        display: 'flex',
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: 'center',
        width: 75,
        height: 75,
        borderRadius: 75 / 2,
        borderColor: Config.primaryColor,
        shadowColor: "#000", 
        shadowOffset: {
            width: 1, 
            height: 2
        }, 
        shadowOpacity: 0.4, 
        shadowRadius: 5,
    },
    icon: {
        fontSize: 75 / 2,
        color: "white"
    }
}

export default connectStyle('holusion.IconPushButton', styles)(IconPushButton);