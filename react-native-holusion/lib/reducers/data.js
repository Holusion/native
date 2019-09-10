'use strict';
import { SET_DATA} from '../actions'

export default function network(state = {items:{},config:{}, projectName:null}, action) {
    switch(action.type) {
        case SET_DATA:
            return Object.assign({}, state, action.data);
        default:
            return state;
    }
}