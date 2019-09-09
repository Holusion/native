'use strict';

import configureStore from "../lib/default_store";


describe("default store",function(){
    test("can have initial state",function(){
        const store = configureStore({name: "foo"});
        const state = store.getState();
        expect(state.data).toHaveProperty("items");
        expect(state.data).toHaveProperty("name", "foo");
    })
})