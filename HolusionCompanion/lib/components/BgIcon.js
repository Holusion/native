import React from "react";
import {StyleSheet} from "react-native";
import { Icon, Button } from "native-base";

export default function BgIcon({status="default", name}){
  let color = BgIcon.colors[status] || BgIcon.colors["default"];
  return <Button style={[styles.button, {backgroundColor: color}]}>
    <Icon style={styles.icon} name={name}/>
  </Button>
}

BgIcon.colors = {
  success: "#5cb85c",
  warning: "#f0ad4e",
  danger: "#d9534f",
  error: "#d9534f",
  default: "#007aff",
  muted: "#666666",
  light: "#f4f4f4",
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
    fontSize: 17,
    lineHeight: 17,
    margin: 0,
    marginRight: 0,
    marginLeft: 0
  }
})