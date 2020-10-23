'use strict';
import netScan from "./lib/netScan";
import {setBasePath} from "@holusion/cache-control";
import * as convert from "./lib/convert";
import * as time from "./lib/time";



import * as screens from "./lib/screens";
import * as components from "./lib/components";
import * as selectors from "./lib/selectors";

import {DownloadProvider} from "./lib/sync/DownloadProvider";


import {useWatch, useAutoPlay, wrapAutoPlay} from "./lib/sync/hooks";

import {DocumentDirectoryPath} from "react-native-fs";
setBasePath(DocumentDirectoryPath);



export {ThemeProvider, FullLoadWrapper} from "./lib/containers";
export {
  netScan,
  convert,
  time,
  screens,
  components,
  selectors,
  useAutoPlay,
  wrapAutoPlay,
}