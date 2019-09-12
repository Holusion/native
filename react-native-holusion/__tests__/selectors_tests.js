'use strict';

import {setNetInfo, setData, setActive, addProduct, removeProduct, selectItem} from "../lib/actions";
import reducers from "../lib/reducers";
import {getItemsIds, getActiveItems, getSelectedItem} from "../lib/selectors";
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
                items,
                selectedCategory: "foofoo"
            }));
            expect(getActiveItems(state)).toEqual([Object.assign({id:"foo"}, items["foo"])]);
        })
        test("return all if selectedCategory is null", function(){
            let state = reducers(initialState, setData({
                items,
                selectedCategory: null
            }));
            expect(getActiveItems(state)).toHaveProperty("length", 2);
        })
    })
    describe("getSelectedItem()",function(){
        test("returns selected item",function(){
            let state = reducers(initialState, setData({items}));
            state = reducers(state, selectItem("bar"));
            expect(getSelectedItem(state)).toEqual(items["bar"]);
        })
    })
})