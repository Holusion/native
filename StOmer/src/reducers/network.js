'use strict';
import { SET_NETINFO } from '../actions'

export default function network  (state = [], action) {
    switch(action.type) {
        case SET_NETINFO:
            return Object.assign({},state, {status: action.status});
        default:
            return state;
    }
}