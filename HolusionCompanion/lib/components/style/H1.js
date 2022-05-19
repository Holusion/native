import React, { useContext} from "react";
import { Text } from "react-native";
import { ThemeContext } from "./ThemeProvider";

export function H1({style={} ,color="primary",children, ...props}){
    const theme = useContext(ThemeContext);
    return <Text style={[
      {
        color: theme.color[color], 
        fontSize: parseInt(theme.fontSize.h1), 
        fontFamily: theme.fontFamily.h1
      }, style
    ]} {...props}>{children}</Text>
  }