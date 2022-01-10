'use strict';
import React from "react";
import { StyleSheet, View } from "react-native"



export default function Progress(props){
    return <View style={progressTheme.bar}>
    <View style={[progressTheme.progress, {width: `${props.value}%`}]}>
    </View>
    <View style={{position: "absolute", left: 0, right: 0, top:0, bottom:0, alignItems: "center"}}>
      {props.children}
    </View>
  </View>  
}

const progressTheme = StyleSheet.create({
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

})

/*const progressTheme = {
  ".pending": {
    progress: {
      backgroundColor: "#00A5E8ff",
    }
  },
  ".blocked": {
    progress: {
      backgroundColor: "#FF9966FF",
    }
  },
  ".complete": {
    progress: {
      backgroundColor: "#28A745FF",
    },
  }
}*/