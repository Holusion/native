
jest.mock("@holusion/cache-control/dist/cache-control-native.js");
import * as props from "@holusion/cache-control/dist/cache-control-native.js";
//console.log("Props : ", Object.keys(props).map(key=> `[${typeof props[key]}] ${key}`));

export const {filename} = jest.requireActual("@holusion/cache-control/dist/cache-control-native.js");
export const setBasePath = jest.fn();
export const createStorage = jest.fn();