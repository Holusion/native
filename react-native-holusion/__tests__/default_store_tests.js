'use strict';

import configureStore from "../lib/default_store";


describe("default store",function(){
    test("can have initial state projectName",function(){
        const store = configureStore({projectName: "foo"});
        const state = store.getState();
        expect(state.data).toHaveProperty("items");
        expect(state.data).toHaveProperty("projectName", "foo");
    })
})