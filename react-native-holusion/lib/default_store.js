'use strict';

import { createStore } from 'redux'
import reducers from "./reducers";
export {createStore};
export default function configureStore({projectName, uuid}={}){
    const initialState = reducers(undefined, {});
    if(typeof projectName !== "undefined")
        initialState.data.projectName = projectName;
    return createStore(reducers, initialState);
};