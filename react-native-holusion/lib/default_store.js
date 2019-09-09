'use strict';

import { createStore } from 'redux'
import reducers from "./reducers";
export {createStore};
export default function configureStore({name}={}){
    const initialState = reducers(undefined, {});
    initialState.data.name = name;
    return createStore(reducers, initialState);
};