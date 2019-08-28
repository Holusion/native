'use strict';
import { SET_PRODUCTS, SET_ACTIVE } from '../actions'

export default function products  (state = [], action) {
    switch(action.type) {
        case SET_PRODUCTS:
            return action.products;
        case SET_ACTIVE:
            const products = state.map(p =>{
                if(p.name == action.name){
                    return Object.assign(p, {active: true});
                }else{
                    return Object.assign(p, {active: false})
                }
            })
            return products;
        default:
            return state;
    }
}