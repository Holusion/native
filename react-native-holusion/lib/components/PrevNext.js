'use strict';
import React from 'react';
import {connectStyle, View, Button, Icon} from "native-base";
import {TouchableOpacity, StyleSheet, Animated, Easing} from "react-native"
import {connect} from "react-redux";

import PropTypes from "prop-types";

import {delay} from "../time";

const AnimatedButton = Animated.createAnimatedComponent(Button);

function PrevNext({style, children}) {
    return (<View style={prevNextTheme.view}>
        <Button key="prev" transparent large style={style.controlButton} onPressIn={()=>props.prev()}>
            <Icon primary large style={style.controlIcons} name="ios-caret-back"/>
        </Button>
        {children}
        <Button key="next" transparent large style={style.controlButton} onPressIn={()=>props.next()}>
            <Icon primary large style={style.controlIcons} name="ios-caret-forward"/>
        </Button>
    </View>)
}

PrevNext.propTypes = {
    children: PropTypes.node,
    target: PropTypes.object,
    next: PropTypes.func.isRequired,
    prev: PropTypes.func.isRequired,
}

const prevNextTheme = StyleSheet.create({
    view: {
        flex: 0,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent:'center',
        alignSelf: 'center',
    },
    controlButton:{
        paddingVertical: 5,
        paddingHorizontal: 5, 
    },
    controlIcons:{
        fontSize: 60,
        height: 60,
        lineHeight: 60,
        fontWeight: "bold"
    },
})

export default connectStyle('Holusion.PrevNext', prevNextTheme)(PrevNext);