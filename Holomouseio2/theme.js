'use strict';
import default_vars from "@holusion/react-native-holusion/native-base-theme/variables/platform";
const local_vars = {
    brandPrimary: "#ae2573ff",
}
export default function getVariables(variables = default_vars){
    return Object.assign(variables, local_vars);
}
