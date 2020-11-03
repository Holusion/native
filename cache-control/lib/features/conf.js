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
}
export const action_strings = Object.keys(actions).reduce((res, k)=>([...res, actions[k]]),[]);

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
}, action) {
    if(action.error){
        return state;
    }
    switch(action.type) {
        case INITIAL_LOAD:
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
        default:
            return state;
    }
}

/**
 * 
 * @param {(default|buttons|swipe|none)} control - one of default, buttons, none
 */
export const setSlidesControl = (control) =>{
    return {type : actions.SET_SLIDES_CONTROL, control}
}
/**
 * 
 * @param {(button|rotate|none)} control - one of button, rotate, none
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

export const getProjectName = (store)=> store.conf.projectName; 
export const setProjectName = (projectName) => {
    return {type: actions.SET_PROJECTNAME, projectName};
}

export const setPasscode = (passcode) => {
    return {type: actions.SET_PASSCODE, passcode};
}

export const getConf = (state)=>{
    return state.conf;
}

export const setConf = ({error, ...conf})=>{
    if(error){
        return {type: INITIAL_LOAD, error};
    }
    return {type: INITIAL_LOAD, conf};
}
