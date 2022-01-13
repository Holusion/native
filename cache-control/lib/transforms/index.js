
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
export {defaultCategoryFactory} from "./defaultCategory";

export {transformMarkdownFactory} from "./transformMarkdown";

export {getMetadata} from "./filerefs";
