'use strict';
import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, Animated, Easing, PanResponder, Dimensions, View } from 'react-native';

import * as convert from "../convert";
import * as time from "../time";


const WIDTH = Dimensions.get('window').width;
/* keep in mind an ipad has a 2x multiplier so divide the real resolution! */
const SPRITE_WIDTH = 200;
const SPRITE_HEIGHT = 100;

const FRAMES = 90;
const COLUMNS = 10;
const DIVIDER = 4;

const IDLE_SPEED = 100;

export default class SpriteCube extends React.Component{
    static last_direction = 1;
    constructor(props){
        super(props);
        this.offset = 0;
        this.last_dx = 0;
        this._handleIdle = this.handleIdle.bind(this);
        this.state = {
            frame: new Animated.Value(0),
        }
        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: this.handlePanResponderStart.bind(this),
            onPanResponderMove: this.handlePanResponderMove.bind(this),
            onPanResponderEnd: this.handlePanResponderEnd.bind(this),
        });

        this.accumulator = new time.Accumulator({
            backoff:150,
            handleChange: this.sendChange.bind(this),
            reset: true,
        });

    }
    componentDidMount(){
        this.active = false;
        this.handleIdle();
        this.sendChange(4*this.last_direction, {angular: false});
    }
    componentWillUnmount(){
        this.active = true; //Will stop the handleIdle callback
        if(this.abortController){
            this.abortController.abort();
        }
    }
    /*
     * Network changes notifier
     */
    sendChange(val, {angular=true}={}){
        //console.warn("sendChange : ", val);
        if(!this.props.target) return;
        if(this.abortController){
            this.abortController.abort();
        }
        const abortController = this.abortController = new AbortController();
        const timeout = setTimeout(()=>{console.warn("abort request");abortController.abort()}, 200);
        //${this.props.target.uri}
        fetch(`http://${this.props.target.url}:3004/${angular?'d':'m'}${val}`, {method: "GET", signal: this.abortController.signal}).then(r=>{
            if(!r.ok){
                console.warn("Fetch sendChange failed : ",r.status);
            }
            clearTimeout(timeout);
            this.abortController = null;
        }).catch((err)=>{
            if (err.name === 'AbortError') return;
            console.warn("Fetch rejected : ",err.message);
        })
    }
    /*
     * Pan Responder handlers
     */
    handlePanResponderStart(){
        this.active = true;
        this.last_dx = 0;
        this.offset = this.state.frame._value;
        this.sendChange(0); // Completely stop
    }
    handlePanResponderMove(e, gestureState){
        if( 0.1 < Math.abs(gestureState.vx)){
            SpriteCube.last_direction =  Math.sign(gestureState.vx);
        }
        this.accumulator.add(gestureState.dx - this.last_dx);
        this.last_dx = gestureState.dx;
        this.move(gestureState.dx);
    }
    handlePanResponderEnd(){
        this.active = false;
        //this.idle_dx = 0
        //this.offset = - this.state.frame._value/SPRITE_WIDTH;
        const duration = ((0 < SpriteCube.last_direction)? this.frame : 360 - this.frame)* IDLE_SPEED;
        requestAnimationFrame(this._handleIdle);
    }

    handleIdle(){
        if(this.active) return;
        this.last_dx += SpriteCube.last_direction;
        this.move(this.last_dx);
        requestAnimationFrame(this._handleIdle);
    }
    move(dx){
        const clamped = convert.normalizeAngle(dx/DIVIDER);
        this.state.frame.setValue(((Math.round(clamped)+ this.offset) % FRAMES));
        //this.refImage.setNativeProps({style: this.cubeStyle});
    }

    render(){
        if(!this.props.target) return null;
        //*
        const pos_x = Animated.modulo(this.state.frame, COLUMNS);
        const tr_x = Animated.multiply(pos_x, -SPRITE_WIDTH);
        const pos_y = Animated.subtract(this.state.frame, pos_x);
        const tr_y = Animated.multiply(pos_y, -SPRITE_HEIGHT/COLUMNS);
        //*/
        return(<View style={styles.container} {...this.panResponder.panHandlers}>
            <View style={styles.content}>
                <Animated.Image ref={component => this.refImage = component} style={{transform: [{translateX: tr_x}, {translateY:tr_y}], width:SPRITE_WIDTH*COLUMNS, height: SPRITE_HEIGHT*(FRAMES/COLUMNS)}} source={this.props.source} />       
            </View>
        </View>)
    }
}
const styles = StyleSheet.create({
    container:{
        zIndex: 100,
        flex: 0,
        paddingHorizontal: 2,
        height: SPRITE_HEIGHT+40,
    },
    content:{
        width: SPRITE_WIDTH, 
        height: SPRITE_HEIGHT,
        overflow:'hidden', 
    }
})
SpriteCube.propTypes = {
    source: PropTypes.any,
    target: PropTypes.shape({uri: PropTypes.string }),
}

SpriteCube.defaultProps = {
    source: require('../../assets/sprite.png')
}
