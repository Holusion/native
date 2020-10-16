'use strict';
export const SET_PRODUCTS = 'SET_PRODUCTS';
export const ADD_PRODUCT = 'ADD_PRODUCT';
export const REMOVE_PRODUCT = 'REMOVE_PRODUCT';
export const SET_ACTIVE_PRODUCT = 'SET_ACTIVE_PRODUCT';

export const SET_NETINFO = 'SET_NETINFO';
export const SET_FIREBASEINFO = "SET_FIREBASEINFO";
export const ADD_TASK = "ADD_TASK";
export const UPDATE_TASK = "UPDATE_TASK";
export const REMOVE_TASK = "REMOVE_TASK";

export const SET_DATA = "SET_DATA";
export const SET_ITEMS = "SET_ITEMS";
export const SET_CONFIG = "SET_CONFIG";

export const SET_SLIDES_CONTROL = "SET_SLIDES_CONTROL";
export const SET_PLAY_CONTROL = "SET_PLAY_CONTROL";
export const SET_DEFAULT_TARGET = "SET_DEFAULT_TARGET";
export const SET_PURGE = "SET_PURGE";
export const SET_PASSCODE = "SET_PASSCODE";
export const SET_CONF = "SET_CONF";

export const SET_PROJECTNAME = "SET_PROJECTNAME";


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

/**
 * 
 * @param {('offline'|'online')} status 
 */
export const setNetInfo = (status)=>{
    return {type: SET_NETINFO, status: status}
}

/**
 * @typedef Task
 * @property {string} id one of taskIds
 * @property {('pending'|'success'|'warn'|'error')} [status=pending] - the task's status
 * @property {string} title - the task's display title. defaults to task.id
 */

/**
 * Add a task
 * @param {Task} task 
 */
export const addTask = ({id,  status="pending", title, ...props})=>{
    return {type: ADD_TASK, id, title: title || id, status, ...props};
}
/**
 * Updates an existing task
 * Creates it if it doesn't exists
 * @param {Task} task
 */
export const updateTask = (props)=>{
    return {type: UPDATE_TASK, ...props};
}
/**
 * Remove a task using it's ID
 * @param {string} id
 */
export const removeTask = (id)=>{
    if(typeof id !== "string") throw new Error("removeTask() id must be a string. Got "+typeof id);
    return {type: REMOVE_TASK, id}
}

export const taskIds = {
    initialLoad: "01_required_initial_load",
    cleanup: "02_cleanup",
    fonts: "03_required_fonts",
    database: "04_firebase_connection",
}


/*
 * Data actions
 */
export const setData = (data) =>{
    return {type: SET_DATA, data};
}
export const setItems = (items) =>{
    return {type: SET_ITEMS, items};
}
export const setConfig = (config) => {
    return {type: SET_CONFIG, config}
}
/**
 * 
 * @param {(default|buttons|swipe|none)} control - one of default, buttons, none
 */
export const setSlidesControl = (control) =>{
    return {type : SET_SLIDES_CONTROL, control}
}
/**
 * 
 * @param {(button|rotate|none)} control - one of button, rotate, none
 */
export const setPlayControl = (control) =>{
    return {type : SET_PLAY_CONTROL, control}
}
export const setDefaultTarget = (name)=>{
    return {type:SET_DEFAULT_TARGET, target: name};
}
export const setPurge = (purge)=>{
    return {type:SET_PURGE, purge: purge};
}

export const setProjectName = (name) => {
    return {type: SET_PROJECTNAME, name};
}

export const setPasscode = (passcode) => {
    return {type: SET_PASSCODE, passcode};
}

export const setConf = (conf)=>{
    return {type: SET_CONF, conf};
}
