'use strict';
import React from "react";
import { connectStyle, View } from 'native-base'
import {StyleSheet} from "react-native"



class Progress extends React.Component{
  render(){
    return <View style={this.props.style.bar}>
    <View style={[this.props.style.progress, {width: `${this.props.value}%`}]}>
    </View>
    <View style={{position: "absolute", left: 0, right: 0, top:0, bottom:0, alignItems: "center"}}>
      {this.props.children}
    </View>
  </View>
  }
}

const progressTheme = {
  bar: {
    display: "flex", 
    width: "100%",
    borderColor: "gray",
    borderRadius: 4,
    overflow: "hidden",
    height: 20,
  },
  progress: {
    height: 20, 
    flex: 0,
    minWidth: 1,
    backgroundColor: "gray",
  },
}

export default connectStyle('Holusion.Progress', progressTheme)(Progress);