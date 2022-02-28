'use strict';
import React, { useState } from "react";
import PropTypes from "prop-types"
import {StyleSheet, TouchableOpacity, Text, View } from "react-native";
import {Svg, Path, Rect, Text as SvgText, G} from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useParsedLink } from "../../ObjectLink";


export function LinkPath({to, fill, shape, d, x, y, height, width, borderRadius, text, textStyle, style={}, ...rest}){
  const [isPressed, setPressed] = useState(false);
  const navigation = useNavigation();
  const {screen, params} = useParsedLink({to});
  const onPress = ()=>{
    setPressed(false)
    navigation.navigate(screen, params)
  }
  const textX = parseFloat(x)+ parseFloat(width)/2
  const textY = parseFloat(y)+ parseFloat(height)/2 + parseFloat(textStyle.fontSize)/4

  const isTransparent = /^#.{6}00$/.test(fill) || fill === "none";

  const s = shape === "rect" ?
  <G onPressIn={()=> to && setPressed(true)} onPressOut={ to && onPress} opacity={isPressed ? 0.7 : 1}>
    <Rect
    fill={ isTransparent && isPressed ? "#ffffff80" : fill }
    x={x} y={y} 
    width={width} height={height} 
    rx={borderRadius} ry={borderRadius} 
    {...rest}/>
    <SvgText style={textStyle} x={textX} y={textY} textAnchor="middle">{text}</SvgText>
  </G>
  :
  <Path 
  fill={ isTransparent && isPressed ? "#ffffff80" : fill }
  opacity={isPressed ? 0.5 : 1}
  onPressIn={()=> setPressed(true)}
  onPressOut={onPress} 
  d={d}
  style={{zIndex:2, ...style}}
  {...rest} />

  return s
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
    .filter(item => !item.shape && typeof item.x !== "undefined" && typeof item.y !== "undefined")
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

    const paths = (props.items|| []).filter(item => item.d || item.shape).map((p, index)=>{
      const key = index + buttons.length;
      return <LinkPath key={key}
        to={p.name}
        shape={p.shape}
        x={p.x || 0}
        y={p.y || 0}
        width={p.width || 0}
        height={p.height || 0}
        borderRadius={p.borderRadius}
        d={p.d}
        fill={p.fill}
        stroke={p.stroke} 
        strokeWidth={p.strokeWidth}
        text={p.text}
        textStyle={{fill:p.textColor, fontSize:p.fontSize || 14 }}
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