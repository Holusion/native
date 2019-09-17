
import Base64 from "Base64";
export function base64ToHex(base64){

  const raw = Base64.atob(base64);
  let HEX = '';

  for ( i = 0; i < raw.length; i++ ) {

    var _hex = raw.charCodeAt(i).toString(16)

    HEX += (_hex.length==2?_hex:'0'+_hex);

  }
  return HEX.toUpperCase();
}
