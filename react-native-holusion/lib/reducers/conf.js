'use strict';
import { SET_CONF, SET_SLIDES_CONTROL, SET_DEFAULT_TARGET, SET_PURGE, SET_PROJECTNAME} from '../actions'

export default function conf(state = {
    projectName: undefined, 
    configurableProjectName: false, // This is read-only from initialization
    default_target: null,
    purge_products: false,
    slides_control: "default",
}, action) {
    switch(action.type) {
        case SET_CONF:
            return Object.assign({}, state, action.conf);
        case SET_DEFAULT_TARGET:
            return Object.assign({}, state, {default_target: action.target});
        case SET_PURGE:
            return Object.assign({}, state, {purge_products: action.purge});
        case SET_SLIDES_CONTROL:
            return Object.assign({}, state, {slides_control: action.controlType});
        case SET_PROJECTNAME:
            if(!state.configurableProjectName){
                console.warn("Trying to modify read-only project name");
                return state;
            }
            return Object.assign({}, state, {projectName: action.name});
        default:
            return state;
    }
}