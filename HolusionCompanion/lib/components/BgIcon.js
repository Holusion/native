import React from "react";
import {StyleSheet, View} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from "../style";

export default function BgIcon({status="info", name}){
  let color = BgIcon.colors[status] || BgIcon.colors["info"];
  return <View style={[styles.button, {backgroundColor: color}]}>
    <Icon style={styles.icon} name={name}/>
  </View>
}

BgIcon.colors = {
  success: theme.SUCCESS_COLOR,
  warning: theme.WARNING_COLOR,
  danger: theme.DANGER_COLOR,
  error: theme.ERROR_COLOR,
  primary: theme.PRIMARY_COLOR,
  info: theme.INFO_COLOR,
  muted: theme.MUTED_COLOR,
  light: theme.LIGHT_COLOR,
  default: theme.INFO_COLOR
}
const styles = StyleSheet.create({
  button: {
    height: 29,
    width: 29,
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: "center",
    borderRadius: 6,
  },
  icon: {
    fontSize: theme.FONT_SIZE_LARGE,
    textAlign: "center",
    color: "white",
    lineHeight: 20,
    margin: 0,
    marginRight: 0,
    marginLeft: 0
  }
})