jest.mock("@holusion/cache-control/dist/cache-control-native.js");

import * as props from "@holusion/cache-control/dist/cache-control-native.js";
//console.log("Props : ", Object.keys(props).map(key=> `[${typeof props[key]}] ${key}`));
export const setBasePath = jest.fn();