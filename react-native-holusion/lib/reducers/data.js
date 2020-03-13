'use strict';
import { SET_DATA, SET_CONFIG, SET_SLIDES_CONTROL, SET_DEFAULT_TARGET, SET_PURGE} from '../actions'

export default function data(state = {
    items:{}, //set in bulk by database applications/:appId/projects
    config:{}, //set in bulk by applications/appId
    projectName: null, 
    default_target: null,
    purge_products: false,
    slides_control: "default",
}, action) {
    switch(action.type) {
        case SET_DEFAULT_TARGET:
            return Object.assign({}, state, {default_target: action.target});
        case SET_PURGE:
            return Object.assign({}, state, {purge_products: action.purge});
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