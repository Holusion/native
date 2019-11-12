'use strict';
import default_vars from "@holusion/react-native-holusion/native-base-theme/variables/platform";

export const theme = {
    fontFamily: "MetaPro-Normal",
    titleFontfamily: "MetaPro-Bold",
    fontFamilyH1: "MetaPro-Bold",
    fontFamilyH2: "MetaPro-Medium",
    brandPrimary: "#e31937ff",
    brandSecondary: "#666666ff",
    fontSizeH2: 24,
}

export default function getVariables(variables = default_vars){
    return Object.assign({}, variables, theme);
}
