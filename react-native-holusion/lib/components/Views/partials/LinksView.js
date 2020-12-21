'use strict';
import React from "react";
import PropTypes from "prop-types"
import {Icon, Text, View} from "native-base";
import {StyleSheet, TouchableOpacity} from "react-native";
import {Svg, Path, Rect, Text as SvgText} from "react-native-svg";
import { useNavigation } from "@react-navigation/native";


export function LinksView(props){
  const navigation = useNavigation();
    const buttons = (props.items || [])
    .filter(item => item.title && typeof item.x !== "undefined" && typeof item.y !== "undefined")
    .map((item, index)=>{
        const color = item.color || "#00000000";
        const borders = {
          borderWidth: 2,
          borderRadius: 4,
          borderColor: color,
          padding: 4,
        }
        const style = {
            position: "absolute",
            display: "flex",
            padding:4,
            flex: 1,
            maxWidth: 250,
            alignItems : "center",
            flexDirection: "row",
            justifyContent: "center",
            borderColor: color,
            borderWidth: 2,
            borderRadius: 4,
            left: (typeof item.x == "number")? item.x : parseInt(item.x),
            top: (typeof item.y == "number")? item.y : parseInt(item.y)
        }
        return (<TouchableOpacity key={index} style={style} onPress={()=> navigation.navigate(name)}>
          <Text style={{color}}>{item.title}</Text>
        </TouchableOpacity>)
    })

    const paths = (props.items|| []).filter(item=> item.d).map(({name, d, fill="none", stroke="none", strokeWidth="1"}, index)=>{
      const key = index + buttons.length;
      return <Path key={key}
        onPress={()=>navigation.navigate(name)}
        d={d} 
        fill={fill} stroke={stroke} strokeWidth={strokeWidth}
      />
    })
    return (<View style={styles.overlay}>
      {(paths.length !==0) && <Svg width="100%" height="100%" viewBox={`0 0 1024 724`}>
        {paths}
      </Svg>}
      {buttons}
    </View>)
}

LinksView.propTypes = {
    items: PropTypes.array.isRequired,
}

const styles = StyleSheet.create({
  overlay: {
    position:"absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }
})