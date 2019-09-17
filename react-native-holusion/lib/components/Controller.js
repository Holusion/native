'use strict';
import React from 'react';
import {connectStyle, View, Button, Icon} from "native-base";
import {TouchableOpacity, StyleSheet, Animated, Easing} from "react-native"
import {connect} from "react-redux";

import PropTypes from "prop-types";

import {delay} from "../time";

const AnimatedButton = Animated.createAnimatedComponent(Button);

class Controller extends React.Component {
    static propTypes = {
        multi: PropTypes.bool.isRequired,
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
                  easing: Easing.linear
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
                  easing: Easing.linear
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

        const content = [(<AnimatedButton key="ctrl" onPressIn={this._onPressIn} onPressOut={this._onPressOut} large style={{
            transform:[{scale: size}],
            zIndex:2,
            padding:5, 
            borderRadius:45, 
        }} >
            <Icon large type="Ionicons" name="pause" style={styles.icon} />
        </AnimatedButton>)];

        if(this.props.multi){
            content.unshift((<Button key="prev" transparent large style={styles.controlButton} onPressIn={()=>this.props.prev()}>
                <Icon primary large style={styles.controlIcons} name="ios-arrow-back"/>
            </Button>))
            content.push((<Button key="next" transparent large style={styles.controlButton} onPressIn={()=>this.props.next()}>
                <Icon primary large style={styles.controlIcons} name="ios-arrow-forward"/>
            </Button>))
        }

        return (<View style={styles.view}>
            {content}
        </View>)
    }
    pause(){
        this.last_request = this.last_request
        .then(()=> fetch(`http://${this.props.target.url}/control/pause`, {method:"POST"}))
        .then(()=>delay(120))
        .catch((e)=>{/*Completely ignore Pause errors */});
    }
}


const controllerTheme = StyleSheet.create({
    view: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent:'center', 
        width: 'auto', 
        backgroundColor: "transparent"
    },
    icon:{
        fontSize: 40,
    },
    controlButton:{
        paddingVertical: 5,
        paddingHorizontal: 15, 
        height:70,
        backgroundColor: "#ffffffcc",
    },
    controlIcons:{
        fontSize: 60,
        height: 60,
        lineHeight: 60,
        fontWeight: "bold"
    },
})

export default connectStyle('Holusion.Controller', controllerTheme)(Controller);