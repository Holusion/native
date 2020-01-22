'use strict';
export const SET_PRODUCTS = 'SET_PRODUCTS';
export const ADD_PRODUCT = 'ADD_PRODUCT';
export const REMOVE_PRODUCT = 'REMOVE_PRODUCT';
export const SET_ACTIVE_PRODUCT = 'SET_ACTIVE_PRODUCT';

export const SET_NETINFO = 'SET_NETINFO';

export const SET_DATA = "SET_DATA";
export const SET_CONFIG = "SET_CONFIG";
export const SET_SLIDES_CONTROL = "SET_SLIDES_CONTROL";
/*
 * Products actions 
 */
export const setProducts = (products) => {
    return {type:SET_PRODUCTS, products}
}
export const addProduct = (product) =>{
    return {type: ADD_PRODUCT, product}
}
export const removeProduct = (nameOrProduct)=>{
    return {type: REMOVE_PRODUCT, name: typeof nameOrProduct === "string"? nameOrProduct: nameOrProduct.name};
}

export const setActive = (item={})=>{
    return {type: SET_ACTIVE_PRODUCT, name: (typeof item === "string")? item : item.name}
}

/*
 * Network actions
 */
export const setNetInfo = (status)=>{
    return {type: SET_NETINFO, status: status}
}

/*
 * Data actions
 */
export const setData = (data) =>{
    return {type: SET_DATA, data};
}

export const setConfig = (config) => {
    return {type: SET_CONFIG, config}
}

export const setSlidesControl = (controlType) =>{
    return {type : SET_SLIDES_CONTROL, controlType}
}