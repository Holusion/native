'use strict';
import { SET_DATA, SET_CONFIG} from '../actions'

export default function data(state = {items:{},config:{}, projectName:null, selectedId: null, selectedCategory:null}, action) {
    switch(action.type) {
        case SET_DATA:
            return Object.assign({}, state, action.data);
        case SET_CONFIG:
            return Object.assign({}, state, {config: action.config});
        default:
            return state;
    }
}