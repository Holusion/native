'use strict';
import { SET_CONF, SET_SLIDES_CONTROL, SET_PLAY_CONTROL, SET_DEFAULT_TARGET, SET_PURGE, SET_PAUSE, SET_PROJECTNAME, SET_PASSCODE} from '../actions'
/**
 * Local app configuration.
 * Not the same as state.data.config, 
 * which is the global "application" configuration from database (ie. the `applications/${appId}` doc)
 * @param {*} state 
 * @param {*} action 
 */
export default function conf(state = {
    projectName: undefined, 
    configurableProjectName: false, // This is read-only from initialization
    default_target: null,
    purge_products: false,
    slides_control: "default",
    play_control: "none",
}, action) {
    switch(action.type) {
        case SET_CONF:
            return Object.assign({}, state, action.conf);
        case SET_DEFAULT_TARGET:
            return Object.assign({}, state, {default_target: action.target});
        case SET_PURGE:
            return Object.assign({}, state, {purge_products: action.purge});
        case SET_SLIDES_CONTROL:
            return Object.assign({}, state, {slides_control: action.control});
        case SET_PLAY_CONTROL:
            return Object.assign({}, state, {play_control: action.control});
        case SET_PROJECTNAME:
            if(!state.configurableProjectName){
                console.warn("Trying to modify read-only project name");
                return state;
            }
            return Object.assign({}, state, {projectName: action.name});
        case SET_PASSCODE:
            return Object.assign({}, state, {passcode: action.passcode});
        default:
            return state;
    }
}