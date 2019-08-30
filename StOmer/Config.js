import { assetManager } from "@holusion/react-native-holusion";

export const setup = () => {
    remoteConfig = assetManager.yamlCache['config'];
}

export let remoteConfig = {};

export const primaryColor = "#00517d";
export const secondaryColor = "#2fafe6"
export const textColor = "#103040";
export const projectName = "StOmer";

export const dangerBackground = "#FFCCCC";
export const dangerText = "#FF1133";
export const dangerButton = "#FFDDDD";

export const warnBackground = "#FEEFB3";
export const warnText = "#9F6000";
export const warnButton = "#FEFFD3";

export const infoBackground = "#BDE5F8";
export const infoText = "#00529B";
export const infoButton = "#BDF6F9";

export const successBackground = "#DFF2BF";
export const successText = "#4F8A10";
export const successButton = "#EFF2CF";