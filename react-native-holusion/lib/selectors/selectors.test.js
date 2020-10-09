'use strict';
import { setNetInfo, setData, setActive, addProduct, removeProduct, addTask, taskIds } from "../actions";
import reducers from "../reducers";
import { 
  getItemsIds, getActiveItems, getSelectedItem, 
  getTasks, getTasksList, getPendingTasks, getBlockingTasks, getSyncTasks, getPendingSyncTasks
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
  



  describe("tasks", ()=>{
    test("getTasks() always return an object", function(){
      expect(getTasks(initialState)).toEqual({});
      const s = reducers(initialState, addTask({id: taskIds.initialLoad, status: "success"}));
      expect(getTasks(s)).toEqual({[taskIds.initialLoad]:{status: "success", title: taskIds.initialLoad}});
    });
    test("getTasksList() always return an  array", function(){
      expect(getTasksList(initialState)).toEqual([]);
      const s = reducers(initialState, addTask({id: taskIds.initialLoad, status: "success"}));
      expect(getTasksList(s)).toEqual([{id: taskIds.initialLoad, status: "success", title: taskIds.initialLoad}]);
    });
    test("getPendingTasks() shows only tasks with status=pending", ()=>{
      let s = reducers(initialState, addTask({id: taskIds.initialLoad, status: "success"}));
      s = reducers(s, addTask({id: taskIds.cleanup, status: "pending", title: "foo"}));
      expect(getPendingTasks(s)).toEqual([{id: taskIds.cleanup, status: "pending", title: "foo"}])
    })
    test("getBlockingTasks() returns only tasks whose name contains 'required'", ()=>{
      let s = reducers(initialState, addTask({id: "required_foo", status: "success", title: "foo"}));
      s = reducers(s, addTask({id: "bar", status: "pending"}));
      expect(getBlockingTasks(s)).toEqual([{id: "required_foo", status: "success", title: "foo"}])
    })

    test("getSyncTasks() get all tasks whose name contains 'sync'", ()=>{
      let s = reducers(initialState, addTask({id: "sync_foo", status: "success", title: "foo"}));
      s = reducers(s, addTask({id: "bar", status: "pending"}));
      expect(getSyncTasks(s)).toEqual([{id: "sync_foo", status: "success", title: "foo"}])
    })

    test("getPendingSyncTasks()", ()=>{
      let s = reducers(initialState, addTask({id: "sync_foo", status: "pending", title: "foo"}));
      s = reducers(s, addTask({id: "sync_bar", status: "success"}));
      expect(getPendingSyncTasks(s)).toEqual([{id: "sync_foo", status: "pending", title: "foo"}])
    })
  })
})
