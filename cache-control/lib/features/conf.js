'use strict';
import { INITIAL_LOAD } from "./status";

export const actions = {
    SET_CONF:  "SET_CONF",
    SET_SLIDES_CONTROL: "SET_SLIDES_CONTROL",
    SET_PLAY_CONTROL: "SET_PLAY_CONTROL",
    SET_DEFAULT_TARGET: "SET_DEFAULT_TARGET",
    SET_PURGE: "SET_PURGE",
    SET_PASSCODE: "SET_PASSCODE",
    SET_PROJECTNAME: "SET_PROJECTNAME",
    SET_TIMEOUT: "SET_TIMEOUT",
    SET_WATCH: "SET_WATCH",
    SET_AUTOCLEAN: "SET_AUTOCLEAN",
}
export const action_strings = Object.keys(actions).reduce((res, k)=>([...res, actions[k]]),[]);
/**
 * @typedef {object} AppConf
 * @property {string} [projectName] 
 * @property {boolean} configurableProjectName: true, // This is read-only from initialization
 * @property {string|null} default_target: null,
 * @property {boolean} purge_products: false,
 * @property {"default"|"buttons"|"swipe"|"none"} slides_control: "default",
 * @property {"button"|"rotate"|"none"} play_control: "none",
 * @property {boolean} watch: true,
 * @property {number} timeout: 0,
 * @property {boolean} autoClean: false,
 */

/**
 * Local app configuration.
 * Not the same as state.data.config, 
 * which is the global "application" configuration from database (ie. the `applications/${appId}` doc)
 * @param {*} state 
 * @param {*} action 
 */
export default function conf(state = {
    projectName: undefined, 
    configurableProjectName: true, // This is read-only from initialization
    default_target: null,
    purge_products: false,
    slides_control: "default",
    play_control: "none",
    watch: true,
    timeout: 0,
    autoClean: false,
}, action) {
    if(action.error){
        return state;
    }
    switch(action.type) {
      case INITIAL_LOAD:
      case actions.SET_CONF:
        return Object.assign({}, state, action.conf);
      case actions.SET_DEFAULT_TARGET:
        return Object.assign({}, state, {default_target: action.target});
      case actions.SET_PURGE:
        return Object.assign({}, state, {purge_products: action.purge});
      case actions.SET_SLIDES_CONTROL:
        return Object.assign({}, state, {slides_control: action.control});
      case actions.SET_PLAY_CONTROL:
        return Object.assign({}, state, {play_control: action.control});
      case actions.SET_PROJECTNAME:
        if(!state.configurableProjectName){
            console.warn("Trying to modify read-only project name");
            return state;
        }
        return Object.assign({}, state, {projectName: action.projectName});
      case actions.SET_PASSCODE:
        return Object.assign({}, state, {passcode: action.passcode});
      case actions.SET_WATCH:
        return Object.assign({}, state, {watch: action.watch});
      case actions.SET_TIMEOUT:
        return Object.assign({}, state, {timeout: action.timeout});
      case actions.SET_AUTOCLEAN:
        return Object.assign({}, state, {autoClean: action.autoClean})
      default:
        return state;
    }
}

/**
 * 
 * @param {AppConf["slides_control"]} control - one of default, buttons, none
 */
export const setSlidesControl = (control) =>{
    return {type : actions.SET_SLIDES_CONTROL, control}
}
/**
 * 
 * @param {AppConf["play_control"]} control - one of button, rotate, none
 */
export const setPlayControl = (control) =>{
    return {type : actions.SET_PLAY_CONTROL, control}
}

export const setDefaultTarget = (name)=>{
    return {type: actions.SET_DEFAULT_TARGET, target: name};
}
export const setPurge = (purge)=>{
    return {type: actions.SET_PURGE, purge: purge};
}

export const getProjectName = (state)=> state.conf.projectName; 
export const setProjectName = (projectName) => {
    return {type: actions.SET_PROJECTNAME, projectName};
}

export const setPasscode = (passcode) => {
    return {type: actions.SET_PASSCODE, passcode};
}

export const getWatch = (state) => state.conf.watch;
export const setWatch = (watch)=>{
  return {type: actions.SET_WATCH, watch: !!watch};
}

export const setTimeout = (timeout)=>{
  return {type: actions.SET_TIMEOUT, timeout};
}
/**
 * Automatically clean cache's unused files
 * @param {boolean} autoClean 
 * @returns 
 */
export const setAutoClean = (autoClean)=>{
  return {type: actions.SET_AUTOCLEAN, autoClean};
}

export const getAutoClean = (state)=> state.conf.autoClean;

export const getConf = (state)=>{
    return state.conf;
}

/**
 * Completely overwrite conf. Only for initial load.
 */
export const setConf = ({error, ...conf})=>{
    if(error){
        return {type: actions.SET_CONF, error};
    }
    return {type: actions.SET_CONF, conf};
}
