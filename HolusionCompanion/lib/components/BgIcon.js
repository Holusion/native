import React from "react";
import {StyleSheet, View} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from "./style";

export default function BgIcon({status="info", name}){
  let color = BgIcon.colors[status] || BgIcon.colors["info"];
  return <View style={[styles.button, {backgroundColor: color}]}>
    <Icon style={styles.icon} name={name}/>
  </View>
}

BgIcon.colors = {
  success: theme.colors.success,
  warning: theme.colors.warning,
  danger: theme.colors.danger,
  error: theme.colors.error,
  primary: theme.colors.primary,
  info: theme.colors.info,
  muted: theme.colors.mutes,
  light: theme.colors.light,
  default: theme.colors.default
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