
import {version, name} from "../../package.json" 

export const getUniqueId = ()=> version;

export const getDeviceName = ()=>Promise.resolve(os.hostname());

export const getApplicationName = ()=> name;