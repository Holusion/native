'use strict';
'use strict';
import { SET_DATA } from '../actions'

export default function network  (state = {}, action) {
    switch(action.type) {
        case SET_DATA:
            return action.data;
        default:
            return state;
    }
}