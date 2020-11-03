'use strict';


export {default as netScan} from "./lib/netScan";

import * as _convert from "./lib/convert";
export const convert=_convert;

import * as _time from "./lib/time";
export const time = _time;


import * as _screens from "./lib/screens";
export const screens = _screens;

import * as _selectors from "./lib/selectors";
export const selectors = _selectors;

export {useWatch, useAutoPlay, wrapAutoPlay} from "./lib/sync/hooks";

export * from "./lib/components";
export * from "./lib/containers";

// BOOTSTRAP
import {setBasePath} from "@holusion/cache-control";
import {DocumentDirectoryPath} from "react-native-fs";
setBasePath(DocumentDirectoryPath);
