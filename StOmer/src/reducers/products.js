'use strict';
import { SET_PRODUCTS } from '../actions'

export function products  (state = [], action) {
    switch(action.type) {
        case SET_PRODUCTS:
            return action.products;
        default:
            return state;
    }
}