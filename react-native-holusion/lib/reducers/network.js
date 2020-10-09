'use strict';
import { SET_NETINFO, SET_FIREBASEINFO } from '../actions'

export default function network  (state = {status: "offline", firebase: "disconnected"}, action) {
    switch(action.type) {
        case SET_NETINFO:
            return Object.assign({},state, {status: action.status});
        default:
            return state;
    }
}