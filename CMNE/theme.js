'use strict';
import default_vars from "@holusion/react-native-holusion/native-base-theme/variables/platform";

import default_theme from '@holusion/react-native-holusion/native-base-theme/components';

export const theme = {
    brandPrimary: "#4155A0ff",
    brandSecondary: "#ff9966ff",
}

export function getVariables(variables = default_vars){
    return Object.assign({}, variables, theme);
}

export function getTheme(variables = getVariables()){
    return Object.assign(default_theme(variables),{
        'Holusion.ImageCard': {
            container: {
                borderWidth: 0,
                flexDirection: "column-reverse",
            },
            image:{
                width: 551/2,
                height: 551/2,
            },
            titleText:{
                fontSize: 32,
                color: variables.brandPrimary,
            }
        }
    })
}