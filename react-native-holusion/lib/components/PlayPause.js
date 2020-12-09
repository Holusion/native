'use strict';
import React from 'react';
import {connectStyle, Button, Icon} from "native-base";
import {StyleSheet, Animated, Easing} from "react-native"

import PropTypes from "prop-types";

import {delay} from "../time";

const AnimatedButton = Animated.createAnimatedComponent(Button);

class PlayPause extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        target: PropTypes.object,
        next: PropTypes.func,
        prev: PropTypes.func,
    }

    constructor(props){
        super(props);
        this.grow = new Animated.Value(0);
        this.last_request = Promise.resolve();
        this._onPressIn = ()=>{
            this.pause();
            this.grow.setValue(0)
            Animated.timing(
                this.grow,
                {
                  toValue: 1,
                  duration: 100,
                  easing: Easing.linear,
                  useNativeDriver: true,
                }
              ).start()
        }
        this._onPressOut = ()=>{
            this.pause();
            this.grow.setValue(1);
            Animated.timing(
                this.grow,
                {
                  toValue: 0,
                  duration: 100,
                  easing: Easing.linear,
                  useNativeDriver: true,
                }
              ).start()
        }
    }
    render(){
        const styles = this.props.style;
        const size = this.grow.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2]
        });

       return (<AnimatedButton key="ctrl" onPressIn={this._onPressIn} onPressOut={this._onPressOut} large style={{
            transform:[{scale: size}],
            zIndex:3,
            padding:5, 
            borderRadius:45,
        }} >
            <Icon large primary type="Ionicons" name="pause" style={styles.icon} />
        </AnimatedButton>)
    }
    pause(){
        this.last_request = this.last_request
        .then(()=> fetch(`http://${this.props.target.url}/control/pause`, {method:"POST"}))
        .then(()=>delay(120))
        .catch((e)=>{/*Completely ignore Pause errors */});
    }
}


const controllerTheme = {

    icon:{
        fontSize: 40,
    },

}

export default connectStyle('Holusion.PlayPause', controllerTheme)(PlayPause);