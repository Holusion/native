'use strict';
import React from "react";
import PropTypes from "prop-types"
import {Icon, Text, View} from "native-base";
import {StyleSheet, TouchableOpacity} from "react-native";
import {Svg, Path, Rect, Text as SvgText} from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useParsedLink } from "../../ObjectLink";


export function LinkPath({to, style={}, ...rest}){
  const navigation = useNavigation();
  const {screen, params} = useParsedLink({to});
  const onPress = ()=>{
    navigation.navigate(screen, params)
  }
  return <Path onPress={onPress} style={{zIndex:2, ...style}} {...rest} />
}

function LinkBtn({to, style={}, children}){
  const navigation = useNavigation();
  const {screen, params} = useParsedLink({to});
  const onPress = ()=>{
    navigation.navigate(screen, params)
  }
  return (<TouchableOpacity style={style} onPress={onPress}>
    {children}
  </TouchableOpacity>)
}

export function LinksView(props){
  const navigation = useNavigation();
    const buttons = (props.items || [])
    .filter(item => !item.d && typeof item.x !== "undefined" && typeof item.y !== "undefined")
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
        return <LinkBtn key={index} style={style} to={item.name}>
          <Text style={{color}}>{item.title || item.name}</Text>
        </LinkBtn>
    })

    const paths = (props.items|| []).filter(item=> item.d).map(({name, d, fill="none", stroke="none", strokeWidth="1"}, index)=>{
      const key = index + buttons.length;
      return <LinkPath key={key}
        to={name}
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