import { INITIAL_LOAD } from "../status";

export const SET_FILES = "SET_FILES";
export const SET_DEPENDENCIES = "SET_DEPENDENCIES";
export const SET_CACHED_FILE = "SET_CACHED_FILE";
export const UNSET_CACHED_FILE = "UNSET_CACHED_FILE";


export const cacheFile = "cache_v1";

export const getFiles = (state)=>state.files.list;
export const setFiles = ({error, ...files}) =>{
  if(error){
    return {type: INITIAL_LOAD, error}
  }
  return {type: INITIAL_LOAD, files}
};


export const getDependencies = (state)=> Object.keys(state.files.list);
/**
 * 
 * @param {string="items","config"} name 
 * @param {object} list - an dict of dest->FileRef 
 */
export const setDependencies = (name, list)=>({type: SET_DEPENDENCIES, name, list});

/**
 * 
 * @param {*} state 
 * @param {string} file 
 */
export const getHash = (state, file) => getCache(state)[
  ((file.indexOf("file://") === 0) ? file.slice("file://".length) : file)
];

/**
 * 
 * @param {string} filename path to the file (absolute path is generally used)
 * @param {string} hash the file's hash. base64-encoded md5 is generally assumed
 * @returns 
 */
export const setHash = (filename, hash) => ({type:SET_CACHED_FILE, file: filename, hash});
/**
 * Remove a file from the index
 * @param {string} filename path to the file. One of the keys in `state.files.cache`
 * @returns 
 */
export const unsetHash = (filename)=>({type:UNSET_CACHED_FILE, file: filename});

/**
 * Get the whole cache state (internal use)
 * @param {*} state 
 */
export const getCache = (state)=> state.files.cache;

export const isCached = (state, name, hash)=> getCache(state)[name] === (hash || true);

/**
 * All file dependencies in cache and fresh
 * @param {import("redux").Store} state 
 * @returns {string[]} a list of file paths
 */
export const getCachedFiles = (state) => Object.keys(state.files.list).filter(f=> {
  return state.files.cache[f] && state.files.cache[f] === state.files.list[f].hash
});

/**
 * all file dependencies not in cache or stale
 * @param {import("redux").Store} state 
 * @returns {string[]}
 */
export const getUncachedFiles = (state) => Object.keys(state.files.list).filter(f=> {
  return !state.files.cache[f] || state.files.cache[f] !== state.files.list[f].hash
});


/**
 * filter out files that are not required for initial render
 * ie. videos
 * @returns {boolean}
 */
export const isRequired = (f)=> !/^video\//.test(f.contentType)

export const getRequiredFiles = (state) => getUncachedFiles(state).filter(f => isRequired(state.files.list[f]));
export const getOtherFiles = (state) => getUncachedFiles(state).filter(f=> !isRequired(state.files.list[f]));

export const getTotalSize = (state) => Object.keys(state.files.list).reduce((size, file) => (size + (state.files.list[file].size)), 0);
export const getUncachedSize = (state) => getUncachedFiles(state).reduce((size, file) => (size + (state.files.list[file].size)), 0);
export const getRequiredSize = (state)=> getRequiredFiles(state).reduce((size, file) => (size + (state.files.list[file].size)), 0);
export const getOtherSize = (state)=> getOtherFiles(state).reduce((size, file)       => (size + (state.files.list[file].size)), 0);

export const isBlocked = (state) => getRequiredFiles(state).length !== 0;