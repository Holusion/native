import React from "react";
import {Text, StyleSheet} from "react-native";
import {default as theme} from "./theme.style.js";

let colors = {
success: theme.SUCCESS_COLOR,
primary: theme.PRIMARY_COLOR,
secondary: theme.SECONDARY_COLOR,
info: theme.INFO_COLOR,
warning: theme.WARNING_COLOR,
danger: theme.DANGER_COLOR,
error: theme.ERROR_COLOR,
muted: theme.MUTED_COLOR,
light: theme.LIGHT_COLOR,}

export function H1({color="primary",children}){
  return <Text style={{color: colors[color], fontSize:22}}>{children}</Text>
}