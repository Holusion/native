import React, { useContext} from "react";
import { Text } from "react-native";
import { ThemeContext } from "./ThemeProvider";

export function H1({style ,color="primary",children}){
    const theme = useContext(ThemeContext);
    return <Text style={[style,{color: theme.colors[color], fontSize: theme.fontSize.h1}]}>{children}</Text>
  }