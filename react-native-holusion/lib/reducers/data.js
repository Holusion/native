'use strict';
import { SET_DATA, SET_CONFIG, SET_SELECT_ITEM_ID, SET_SELECT_CATEGORY} from '../actions'

export default function data(state = {items:{},config:{}, projectName:null, selectedId: null, selectedCategory:null}, action) {
    switch(action.type) {
        case SET_DATA:
            return Object.assign({}, state, action.data);
        case SET_CONFIG:
            return Object.assign({}, state, {config: action.config});
        case SET_SELECT_ITEM_ID:
            return Object.assign({}, state, {selectedId:action.id});
        case SET_SELECT_CATEGORY:
            return Object.assign({}, state, {selectedCategory: action.id})
        default:
            return state;
    }
}