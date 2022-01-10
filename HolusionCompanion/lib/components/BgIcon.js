import React from "react";
import {StyleSheet, View} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from "./style";

export default function BgIcon({status="info", name}){
  let color = BgIcon.color[status] || BgIcon.color["info"];
  return <View style={[styles.button, {backgroundColor: color}]}>
    <Icon style={styles.icon} name={name}/>
  </View>
}

BgIcon.color = {...theme.color}
const styles = StyleSheet.create({
  button: {
    height: 32,
    width: 32,
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: "center",
    borderRadius: 6,
  },
  icon: {
    fontSize: 16,
    textAlign: "center",
    color: "white",
    lineHeight: 20,
    margin: 0,
    marginRight: 0,
    marginLeft: 0
  }
})