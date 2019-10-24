'use strict';
import default_vars from "@holusion/react-native-holusion/native-base-theme/variables/platform";
const local_vars = {
    brandPrimary: "#ae2573ff",
    buttonPrimaryBg: "#ae2573ff",
    fontSizeH1: 38,
    fontSizeH2: 32,
}
export default function getVariables(variables= default_vars){
    return {...variables, ...local_vars};
}
