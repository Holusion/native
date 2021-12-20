import React, { useContext} from "react";
import { Text } from "react-native";
import { ThemeContext } from "./ThemeProvider";

export function H2({style ,color="secondary",children}){
    const theme = useContext(ThemeContext);
    return <Text style={[style,{color: theme.colors[color], fontSize: theme.fontSize.h2}]}>{children}</Text>
  }