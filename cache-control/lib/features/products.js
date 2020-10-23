'use strict';
import {createSelector} from "reselect";
export const SET_PRODUCTS = 'SET_PRODUCTS';
export const ADD_PRODUCT = 'ADD_PRODUCT';
export const REMOVE_PRODUCT = 'REMOVE_PRODUCT';
export const SET_ACTIVE_PRODUCT = 'SET_ACTIVE_PRODUCT';

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


/**
 * @typedef Product
 * @property {string} name - the product's hostname
 * @property {string} url - the product's network address
 */


/**
 * Overwrite the whole products state
 * @param {Product[]} products
 */
export const setProducts = (products) => {
  return {type:SET_PRODUCTS, products}
}
/**
* add a product to the available list
* @param {Product} product 
*/
export const addProduct = (product) =>{
  return {type: ADD_PRODUCT, product}
}
/**
* Remove a product from the available list
* @param {string|Product} nameOrProduct - the product's name or an object with a "name" property
*/
export const removeProduct = (nameOrProduct)=>{
  return {type: REMOVE_PRODUCT, name: typeof nameOrProduct === "string"? nameOrProduct: nameOrProduct.name};
}
/**
* Set a product as "active" to be picked by getActiveProduct() selector
* @param {string|Product} nameOrProduct - the product's name or an object with a "name" property
*/
export const setActive = (nameOrProduct={})=>{
  return {type: SET_ACTIVE_PRODUCT, name: (typeof nameOrProduct === "string")? nameOrProduct : nameOrProduct.name}
}
/*
 * Products Selectors
 */
const getProducts = (state) => state.products;

export const getActiveProduct = createSelector(
    [getProducts],
    (products)=> products.find(p => p.active == true)
)
