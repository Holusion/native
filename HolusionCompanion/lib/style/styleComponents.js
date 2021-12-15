import React, { useContext} from "react";
import { Text } from "react-native";
import { default as defaultTheme } from "./theme.style.js";



const ThemeContext = React.createContext(defaultTheme);

export function ThemeProvider({children}){
  //get custom theme */
  return <ThemeContext.Provider value={defaultTheme}>
    {children}
  </ThemeContext.Provider>
}


export function H1({style ,color="primary",children}){
  const theme = useContext(ThemeContext);
  return <Text style={[style,{color: theme.colors[color], fontSize: theme.fontSize.h1}]}>{children}</Text>
}
