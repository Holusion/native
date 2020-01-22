'use strict';
import { SET_DATA, SET_CONFIG, SET_SLIDES_CONTROL} from '../actions'

export default function data(state = {
    items:{},
    config:{}, 
    projectName:null, 
    userName: null, 
    password: null,
    slides_control: "default",
}, action) {
    switch(action.type) {
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