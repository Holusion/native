/**
 * trivial path.join replacement.
 * Use with care
 * @param  {...string} args 
 */
export function join(...args) {
  if (args.length === 0)
    return '.';
  let joined;
  for (let i = 0; i < args.length; ++i) {
    const arg = args[i];
    if(typeof arg !== "string") throw new Error("path segments must be strings ("+typeof arg+")");
    if (arg.length > 0) {
      if (joined === undefined)
        joined = arg;
      else
        joined += `/${arg}`;
    }
  }
  if (joined === undefined)
    return '.';
  return joined.replace(/\/\//g,"/");
}
export function basename(file){
  return file.split(sep).slice(-1)[0];
}


export const sep = '/';