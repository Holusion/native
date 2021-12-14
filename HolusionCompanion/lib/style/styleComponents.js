import {React, useContext} from "react";
import {Text, StyleSheet} from "react-native";
import {default as theme} from "./theme.style.js";

let colors = {
success: theme.colors.success,
primary: theme.colors.primary,
secondary: theme.colors.secondary,
info: theme.colors.info,
warning: theme.colors.warning,
danger: theme.colors.danger,
error: theme.colors.error,
muted: theme.colors.muted,
light: theme.colors.light,
}


const ThemeContext = React.createContext(theme);

export function ThemeProvider({children}){
  return <ThemeContext.Provider value={theme}>
    {children}
  </ThemeContext.Provider>
}

export function H1({color="primary",children}){
  const theme = useContext(ThemeContext)
  return <Text style={{color: theme.colors[color], fontSize:22}}>{children}</Text>
}