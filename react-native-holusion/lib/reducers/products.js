'use strict';
import { SET_PRODUCTS, SET_ACTIVE_PRODUCT, ADD_PRODUCT, REMOVE_PRODUCT} from '../actions'

export default function products  (state = [], action) {
    switch(action.type) {
        case SET_PRODUCTS:
            return action.products;
        case SET_ACTIVE_PRODUCT:
            const products = state.map(p =>{
                if(p.name == action.name){
                    return Object.assign(p, {active: true});
                }else{
                    return Object.assign(p, {active: false})
                }
            })
            return products;
        case ADD_PRODUCT:
            const product_index = state.findIndex(p=> p.name == action.product.name);
            if(product_index === -1){
                return [action.product].concat(state);
            }else{
                const new_state = [].concat(state);
                new_state.splice(product_index, 1,  action.product);
                return new_state;
            }
        case REMOVE_PRODUCT:
            return state.filter(elem => elem.name != action.name)
        default:
            return state;
    }
}