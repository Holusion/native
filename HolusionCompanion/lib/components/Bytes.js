import React from "react";
import {Text} from "react-native";

export function formatBytes(bytes, si){
  var thresh = si ? 1000 : 1024;
  if(Math.abs(bytes) < thresh) {
      return bytes + ' B';
  }
  var units = si
      ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
      : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
  var u = -1;
  do {
      bytes /= thresh;
      ++u;
  } while(Math.abs(bytes) >= thresh && u < units.length - 1);
  return Math.round(bytes*100)/100 + ' '+units[u];
}


export default function Bytes({children, si=true, radix=10, ...props}){
  const b = typeof children === "number"? children : parseInt(children, radix);
  return <Text {...props}>
    {Number.isSafeInteger(b)?formatBytes(b, si):"NaN"}
  </Text>
}
