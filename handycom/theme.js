'use strict';
import default_vars from "@holusion/react-native-holusion/native-base-theme/variables/platform";

export const theme = {
    brandPrimary: "#008193ff",
    brandSecondary: "#ff9966ff",
}

export default function getVariables(variables = default_vars){
    return Object.assign({}, variables, theme);
}
