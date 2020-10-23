
jest.mock("@holusion/cache-control/dist/cache-control-native.js");
//console.log("Props : ", Object.keys(props).map(key=> `[${typeof props[key]}] ${key}`));

let mod = jest.requireActual("@holusion/cache-control/dist/cache-control-native.js");
mod.setBasePath = jest.fn();
mod.createStorage = jest.fn();

module.exports = mod;