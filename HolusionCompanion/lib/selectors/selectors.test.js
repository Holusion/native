'use strict';
import { setData, addProduct} from "@holusion/cache-control";
import {reducers} from "@holusion/cache-control";
import { 
  getItemsIds, getActiveItems, getSelectedItem,
} from ".";



describe("selectors", function () {
  const initialState = reducers(undefined, {});
  const initialStateCopy = Object.assign({}, initialState);
  const items = { foo: { name: "foo", category: "foofoo" }, bar: { name: "bar", category: "barbar" } };
  afterEach(function () {
    //Be sure state is never mutated, because const doesn't ensure this.
    expect(initialState).toEqual(initialStateCopy);
  })
  
  describe("items", ()=>{
    afterEach(function () {
      getItemsIds.resetRecomputations();
      getActiveItems.resetRecomputations();
    })
    describe("getItemsIds()", function () {
      test('return an array from initialState', function () {
        expect(getItemsIds(initialState)).toBeInstanceOf(Array);
      })
      test("don't recompute when items are not changed", function () {
        let state = initialState;
        getItemsIds(state);
        expect(getItemsIds.recomputations()).toEqual(0);
        state = reducers(state, addProduct({ name: "foo" }));
        expect(getItemsIds.recomputations()).toEqual(0);
      })
    })
    describe("getItemsIds()", function () {
      test('return an array from initialState', function () {
        expect(getItemsIds(initialState)).toBeInstanceOf(Array);
      })
      test("don't recompute when items are not changed", function () {
        let state = initialState;
        getItemsIds(state);
        expect(getItemsIds.recomputations()).toEqual(0);
        state = reducers(state, addProduct({ name: "foo" }));
        expect(getItemsIds.recomputations()).toEqual(0);
      })
    })
    describe("getActiveItems()", function () {
      test("filter active products", function () {
        let state = reducers(initialState, setData({
          items
        }));
        expect(getActiveItems(state, { selectedCategory: "foofoo" })).toEqual([Object.assign({ id: "foo" }, items["foo"])]);
      })
      test("return all if selectedCategory is null", function () {
        let state = reducers(initialState, setData({
          items
        }));
        expect(getActiveItems(state, { selectedCategory: null })).toHaveProperty("length", 2);
      })
    })
  
    describe("getSelectedItem()", function () {
      test("returns selected item", function () {
        let state = reducers(initialState, setData({ items }));
        expect(getSelectedItem(state, { selectedId: "bar" })).toEqual(items["bar"]);
        expect(getSelectedItem.recomputations()).toEqual(1);
        expect(getSelectedItem(state, { selectedId: "bar" })).toEqual(items["bar"]);
        expect(getSelectedItem.recomputations()).toEqual(1);
  
      })
    });
  })
})
