'use strict';
import { SET_DATA, SET_CONFIG, SET_ITEMS} from '../actions'

export default function data(state = {
    items:{}, //set in bulk by database applications/:appId/pages
    config:{}, //set in bulk by applications/appId
}, action) {
    switch(action.type) {
        case SET_DATA:
            return Object.assign({}, state, action.data);
        case SET_ITEMS:
            return Object.assign({}, state, {items: action.items});
        case SET_CONFIG:
            return Object.assign({}, state, {config: action.config});
        default:
            return state;
    }
}