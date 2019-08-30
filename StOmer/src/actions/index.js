'use strict';
export const SET_PRODUCTS = 'SET_PRODUCTS';
export const SET_ACTIVE = 'SET_ACTIVE';

export const SET_NETINFO = 'SET_NETINFO';

export const SET_DATA = "SET_DATA";


export const setProducts = (products) => {
    return {type:SET_PRODUCTS, products}
}
export const setActive = (item)=>{
    return {type: SET_ACTIVE, name: item.name}
}
export const setNetInfo = (status)=>{
    return {type: SET_NETINFO, status: status}
}
export const setData = (data) =>{
    return {type: SET_DATA, data};
}