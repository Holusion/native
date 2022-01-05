
/**
 * @callback Transform
 * @param {object} data - data object from firestore
 * @param {string} [data.mainText] - optional main text field
 */

/**
 * @callback TransformFactory
 * @param {string} projectName - the application base name
 * @returns {Transform} - transform function
 */


export {makeLocalFactory} from "./makeLocal";
import {makeLocalFactory} from "./makeLocal";

export {transformMarkdownFactory} from "./transformMarkdown";
import {transformMarkdownFactory} from "./transformMarkdown";

export {getMetadata} from "./filerefs";

/**
 * 
 * @param {string} projecName 
 * @returns {Array<Transform>} - an array of default (supposed safe) transforms
 */
export function defaultTransformsFactory(projecName){
  return [
    makeLocalFactory(projecName),
    transformMarkdownFactory(projecName),
    (d)=>{
      if(typeof d.category === "undefined") d.category = d.id;
      console.log("Category for %s : %s", d.id, d.category);
      return [d, new Set()];
    },
  ];
}
