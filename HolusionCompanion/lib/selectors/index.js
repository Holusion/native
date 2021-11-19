'use strict';
import { createSelector } from 'reselect'

import {getItems} from "@holusion/cache-control";

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
        return items.filter(i => category == i.category)
    }
)

export const getSelectedItem = createSelector(
    [getItems, getSelectedId],
    (itemsMap, id) => {
        return itemsMap[id]
    }
)
