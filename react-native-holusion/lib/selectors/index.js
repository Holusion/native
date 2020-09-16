'use strict';
import { createSelector } from 'reselect'


/*
 * Data selectors
 */
export const getData = (state)=> state.data;
export const getConfig = (state)=> getData(state).config;
/**
 * get app local configuration (different from getConfig that gives project's configuration)
 */
export const getConf = (state)=> state.conf;
export const getItems = (state) => state.data.items;
const getSelectedId = (state, props) => props.selectedId;
const getSelectedCategory = (state, props) => props.selectedCategory;

export const getItemsIds = createSelector(
    [getItems],
    (items) => Object.keys(items)
)

export const getItemsArray = createSelector(
    [getItemsIds, getItems],
    (ids,items) => ids.map(id => Object.assign({id}, items[id]) ),
)


export const getActiveItems = createSelector(
    [getItemsArray, getSelectedCategory],
    (items, category)=>{
        if(!category) return items;
        return items.filter(i => {
            if(i.theme) return category == i.theme;
            if(i.category) return category == i.category;
        })
    }
)

export const getSelectedItem = createSelector(
    [getItems, getSelectedId],
    (itemsMap, id) => {
        return itemsMap[id]
    }
)

/*
 * Products Selectors
 */
const getProducts = (state) => state.products;

export const getActiveProduct = createSelector(
    [getProducts],
    (products)=> products.find(p => p.active == true)
)

const getTasks = (state)=> state.tasks.list;

export const getSyncTasks = createSelector(
    [getTasks],
    (tasks)=>{
        return Object.keys(tasks).filter((t)=> /sync-/.test(t)).map(t=> tasks[t]);
    }
)

export const getPendingSyncTasks = createSelector(
    [getSyncTasks],
    (tasks)=> tasks.filter(t=> t.status ==="pending")
)