'use strict';

import {enableFetchMocks} from 'jest-fetch-mock';

import {AbortController} from "abort-controller/dist/abort-controller";
//Auto-fix AbortController until it's done upstream
global.AbortController = global.AbortController || AbortController;

class FormData{
    constructor(){
        if(!Array.isArray(FormData.data)) FormData.data = [];
    }
    static data;
    static _reset(){
        FormData.data = [];
    }
    append(d){
        FormData.data.push(d);
    }
}
//Auto-fix FormData
global.FormData = global.FormData || FormData;
enableFetchMocks();