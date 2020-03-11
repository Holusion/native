'use strict';
import { SET_DATA, SET_CONFIG, SET_SLIDES_CONTROL, SET_DEFAULT_TARGET} from '../actions'

export default function data(state = {
    items:{}, //set in bulk by database applications/:appId/projects
    config:{}, //set in bulk by applications/appId
    projectName: null, 
    default_target: null,
    slides_control: "default",
}, action) {
    switch(action.type) {
        case SET_DEFAULT_TARGET:
            return Object.assign({}, state, {default_target: action.target});
        case SET_SLIDES_CONTROL:
            return Object.assign({}, state, {slides_control: action.controlType});
        case SET_DATA:
            return Object.assign({}, state, action.data);
        case SET_CONFIG:
            return Object.assign({}, state, {config: action.config});
        default:
            return state;
    }
}