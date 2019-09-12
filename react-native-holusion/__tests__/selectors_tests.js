'use strict';

import {setNetInfo, setData, setActive, addProduct, removeProduct} from "../lib/actions";
import reducers from "../lib/reducers";
import {getItemsIds, getActiveItems, getSelectedItem, getActiveProduct} from "../lib/selectors";
describe("test selectors", function(){
    const initialState = reducers(undefined,{});
    const initialStateCopy = Object.assign({}, initialState);
    const items = {"foo": {collection:"foofoo"}, "bar":{collection: "barbar"}};

    afterEach(function(){
        //Be sure state is never mutated, because const doesn't ensure this.
        expect(initialState).toEqual(initialStateCopy);
        getItemsIds.resetRecomputations();
        getActiveItems.resetRecomputations();
    })
    describe("getItemsIds(",function(){
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