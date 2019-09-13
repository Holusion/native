'use strict';
import React from 'react';
import {View, Button, Icon} from "native-base";
import {TouchableOpacity, StyleSheet, Animated, Easing} from "react-native"
import {connect} from "react-redux";

import {delay} from "../time";

const AnimatedButton = Animated.createAnimatedComponent(Button);

class Controller extends React.Component {
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
        const size = this.grow.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2]
        });
        return (<AnimatedButton onPressIn={this._onPressIn} onPressOut={this.onPressOut} large primary  style={{zIndex:2, padding:5, borderRadius:45, transform:[{scale: size}] }} >
            <Icon large type="Ionicons" name="pause" style={{fontSize:40}} />
        </AnimatedButton>)
    }
    pause(){
        this.last_request = this.last_request
        .then(()=> fetch(`http://${this.props.target.url}/control/pause`, {method:"POST"}))
        .then(()=>delay(70))
        .catch((e)=>{/*Completely ignore Pause errors */});
    }
}
function mapStateToProps(state){
    const {products} = state;
    const target = products.find(p => p.active == true);
    return {
        target
    }
}
const styles = StyleSheet.create({
    button:{
        padding:5, 
        borderRadius: 50
    },
    icon:{
        fontSize: 40,
    }
})
export default connect(mapStateToProps,{})( Controller);