'use strict';
import { createSelector } from 'reselect'


/*
 * Data selectors
 */
const getData = (state)=> state.data;
const getSelectedId = (state) => state.data.selectedId;
const getSelectedCategory = (state) => state.data.selectedCategory;
const getItems = (state) => state.data.items

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
            if(i.collection) return category == i.collection;
            if(i.category) return category == i.category;
        })
    }
)

export const getSelectedItem = createSelector(
    [getItems, getSelectedId],
    (itemsMap, id) => {
        console.log("Search for id :", id, "in", itemsMap);
        return itemsMap[id]
    }
)

/*
 * Products Selectors
 */
const getProducts = (state) => state.products;

export const connectedProduct = createSelector(
    [getproducts],
    (products)=> products.find(p => p.active == true)
)