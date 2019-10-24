'use strict';

import { createStore } from 'redux'
import reducers from "./reducers";
export {createStore};
export default function configureStore({projectName, userName, password}={}){
    const initialState = reducers(undefined, {});
    if(typeof projectName !== "undefined")
        initialState.data.projectName = projectName;
    if(typeof userName !== "undefined")
        initialState.data.userName = userName;
    if(typeof projectName !== "undefined")
        initialState.data.password = password;
    return createStore(reducers, initialState);
};