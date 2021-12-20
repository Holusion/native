import React from "react";
import { default as defaultTheme} from "./theme.style"

export const ThemeContext = React.createContext(defaultTheme);

export function ThemeProvider({children}){
  //get custom theme */
  return <ThemeContext.Provider value={defaultTheme}>
    {children}
  </ThemeContext.Provider>
}