'use strict';
import {setNetInfo, setData, setActive, addProduct, removeProduct, setSlidesControl} from "../lib/actions";
import reducers from "../lib/reducers";
import {getItemsIds, getActiveItems, getSelectedItem, getActiveProduct} from "../lib/selectors";
import configureStore from "../lib/default_store";


describe("default store",function(){
    test("can have initial state projectName",function(){
        const store = configureStore({projectName: "foo"});
        const state = store.getState();
        expect(state.data).toHaveProperty("items");
        expect(state.data).toHaveProperty("projectName", "foo");
    })
})

describe("test store", function(){
    const initialState = reducers(undefined,{});
    const initialStateCopy = Object.assign({}, initialState);
    afterEach(function(){
        //Be sure state is never mutated, because const doesn't ensure this.
        expect(initialState).toEqual(initialStateCopy);
    })
    describe("network",function(){
        test('network starts as offline',function(){
            expect(initialState).toHaveProperty("network");
            expect(initialState.network).toHaveProperty("status", "offline");
        })
        test("setNetInfo() changes network status", function(){
            const s = reducers(initialState, setNetInfo("online"));
            expect(s.network).toHaveProperty("status", "online");
        })
    })
    describe("products", function(){
        test("product list starts empty", function(){
            expect(initialState).toHaveProperty("products");
            expect(initialState.products).toBeInstanceOf(Array);
            expect(initialState.products).toHaveProperty("length", 0);
        })
        test("can add a product",function(){
            const {products} = reducers(initialState, addProduct({name:"foobar"}));
            expect(products).toHaveProperty("length", 1);
        })
        test("can remove a product with its name ", function(){
            const s = reducers(initialState, addProduct({name:"foobar"}));
            const {products} = reducers(s, removeProduct("foobar"));
            expect(products).toHaveProperty("length", 0);
        })
        test("can remove a product with its object", function(){
            const p = {name:"foobar"};
            const s = reducers(initialState, addProduct(p));
            const {products} = reducers(s, removeProduct(p));
            expect(products).toHaveProperty("length", 0);
        })
        test("can set and unset an active product",function(){
            const p = {name:"foobar"};
            let s = reducers(initialState, addProduct(p));
            s = reducers(s, setActive(p));
            expect(s.products).toEqual([{name: "foobar", active: true}])
            s = reducers(s, setActive());
            expect(s.products).toEqual([{name: "foobar", active: false}])
        })
        describe("getActiveProduct()",function(){
            let state;
            beforeEach(function(){
                state = reducers(initialState, addProduct({name:"foo"}));
                state = reducers(state, addProduct({name:"bar"}));
                state = reducers(state, addProduct({name:"baz"}));
            })
            test("no default", function(){
                expect(getActiveProduct(state)).not.toBeTruthy();
            })
            test("can get active product",function(){
                state = reducers(state, setActive({name: "bar"}));
                expect(getActiveProduct(state)).toEqual({name: "bar", active: true});
            })
        })
    })
    describe("data",function(){
        test("can set data", function(){
            const d = {items:{foo:{name:"foo", status: "bar"}}, projectName:"foo", selectedId: "foo", config: {}};
            const s = reducers(initialState, setData(d));
            expect(s.data).toHaveProperty("items", {foo:{name:"foo", status: "bar"}});
            expect(s.data).toHaveProperty("projectName","foo");
            expect(s.data).toHaveProperty("selectedId","foo");
        })
        test("publish update after setData",function(done){
            const d = {items:{foo:{name:"foo", status: "bar"}}, projectName:"foo", selectedId: "foo", config: {}};
            const store = configureStore();
            const initialState = store.getState();
            store.subscribe(function(){
                const state = store.getState();
                expect(state.data).not.toBe(initialState.data);
                expect(state.data).toHaveProperty("items", {foo:{name:"foo", status: "bar"}});
                done();
            })
            store.dispatch(setData(d));
        })
        test("can set only selected keys of data", function(){
            const d = {items:{foo:{name:"foo", status: "bar"}}};
            const s = reducers(initialState, setData(d));
            expect(s.data.items).toEqual(d.items);
            expect(s.data).toHaveProperty("config", {});
        })
        test("can change slides control interface", function(done){
            const store = configureStore();
            let state = store.getState();
            expect(state.data).toHaveProperty("slides_control", "default");
            store.subscribe(function(){
                state = store.getState();
                expect(state.data).toHaveProperty("slides_control", "hidden");
                done();
            })
            store.dispatch(setSlidesControl("hidden"))
        })
        describe("selectors", function(){
            const items = {foo:{name:"foo", category:"foofoo"}, bar: {name: "bar", category: "barbar"}};
            afterEach(function(){
                getItemsIds.resetRecomputations();
                getActiveItems.resetRecomputations();
            })
            describe("getItemsIds()",function(){
                test('return an array from initialState',function(){
                    expect(getItemsIds(initialState)).toBeInstanceOf(Array);
                })
                test("don't recompute when items are not changed",function(){
                    let state = initialState;
                    getItemsIds(state);
                    expect(getItemsIds.recomputations()).toEqual(0);
                    state = reducers(state, addProduct({name:"foo"}));
                    expect(getItemsIds.recomputations()).toEqual(0);
                })
            })
            describe("getItemsIds()",function(){
                test('return an array from initialState',function(){
                    expect(getItemsIds(initialState)).toBeInstanceOf(Array);
                })
                test("don't recompute when items are not changed",function(){
                    let state = initialState;
                    getItemsIds(state);
                    expect(getItemsIds.recomputations()).toEqual(0);
                    state = reducers(state, addProduct({name:"foo"}));
                    expect(getItemsIds.recomputations()).toEqual(0);
                })
            })
            describe("getActiveItems()",function(){
                test("filter active products",function(){
                    let state = reducers(initialState, setData({
                        items
                    }));
                    expect(getActiveItems(state,{selectedCategory: "foofoo"})).toEqual([Object.assign({id:"foo"}, items["foo"])]);
                })
                test("return all if selectedCategory is null", function(){
                    let state = reducers(initialState, setData({
                        items
                    }));
                    expect(getActiveItems(state, {selectedCategory: null})).toHaveProperty("length", 2);
                })
            })
            describe("getSelectedItem()",function(){
                test("returns selected item",function(){
                    let state = reducers(initialState, setData({items}));
                    expect(getSelectedItem(state, {selectedId:"bar"})).toEqual(items["bar"]);
                    expect(getSelectedItem.recomputations()).toEqual(1);
                    expect(getSelectedItem(state, {selectedId:"bar"})).toEqual(items["bar"]);
                    expect(getSelectedItem.recomputations()).toEqual(1);
        
                })
            })
            
        })
    })
})