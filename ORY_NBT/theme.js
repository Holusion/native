'use strict';
import default_vars from "@holusion/react-native-holusion/native-base-theme/variables/platform";

export const theme = {
    fontFamily: "DaxOT-Regular",
    titleFontfamily: "DaxOT-Black",
    fontFamilyH1: "DaxOT-Black",
    fontFamilyH2: "DaxOT-Bold",
    brandPrimary: "#5A5099FF",
    brandSecondary: "#9b8fc9FF",
}

export default function getVariables(variables = default_vars){
    return Object.assign({}, variables, theme);
}
