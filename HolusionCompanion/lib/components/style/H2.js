import React, { useContext} from "react";
import { Text } from "react-native";
import { ThemeContext } from "./ThemeProvider";

export function H2({style={} ,color="secondary",children}){
    const theme = useContext(ThemeContext);
    return <Text style={[
      {
        color: theme.color[color], 
        fontSize: theme.fontSize.h2, 
        fontFamily: theme.fontFamily.h2
      },
      style
    ]}>{children}</Text>
  }