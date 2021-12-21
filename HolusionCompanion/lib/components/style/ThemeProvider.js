import React from "react";
import { useSelector } from "react-redux";

import { default as defaultTheme} from "./theme.style"
import useFonts from "./useFonts";


export const ThemeContext = React.createContext(defaultTheme);


function deepMerge(a,b){
  if(typeof a !== "object" || typeof b !== "object") return b || a;
  const result = {};
  Object.keys(a).forEach(key=>{
    result[key] = deepMerge(a[key], b[key]);
  });
  Object.keys(a).forEach(key=>{
    if(typeof b[key] === "undefined") result[key] = a[key];
  });
  return result;
}


export function ThemeProvider({children}){
  const fontsLoaded = useFonts();
  const {themeVariables} = useSelector(state=>state.data.config);
  //get custom theme */
  return <ThemeContext.Provider value={fontsLoaded?deepMerge(defaultTheme, themeVariables):defaultTheme}>
    {children}
  </ThemeContext.Provider>
}