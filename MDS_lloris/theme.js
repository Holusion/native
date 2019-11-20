'use strict';
import default_vars from "@holusion/react-native-holusion/native-base-theme/variables/platform";

export const theme = {
    titleFontFamily: "Oswald",
    fontFamily: "Circular-Book",
    brandPrimary: "#034EA2FF",
    brandSecondary: "#00D8A5ff",
}

export default function getVariables(variables = default_vars){
    return Object.assign({}, variables, theme);
}
