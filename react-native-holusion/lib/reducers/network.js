'use strict';
import { SET_NETINFO, SET_FIREBASEINFO } from '../actions'

export default function network  (state = {status: "offline", firebase: "disconnected", tasks: new Map()}, action) {
    switch(action.type) {
        case SET_FIREBASEINFO:
            return Object.assign({}, state, {firebase: action.status});
        case SET_NETINFO:
            return Object.assign({},state, {status: action.status});
        default:
            return state;
    }
}