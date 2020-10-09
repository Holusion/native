'use strict';
import { addTask, removeTask, updateTask } from "../actions";
import reducers from ".";


describe("reducers", function () {
  const initialState = reducers(undefined, {});
  const initialStateCopy = Object.assign({}, initialState);
  afterEach(function () {
    //Be sure state is never mutated, because const doesn't ensure this.
    expect(initialState).toEqual(initialStateCopy);
  })

  describe("tasks", function () {
    test("is created with no pending tasks", function () {
      expect(initialState.tasks.list).toEqual({});
    })
    test("can add tasks", function () {
      const s = reducers(initialState, addTask({id: "foo"}));
      expect(s.tasks.list).toEqual(({foo:{title: "foo", status: "pending"}}));
    })
    test("can add tasks with just a human-readable title", function () {
      const s = reducers(initialState, addTask({id: "foo", title: "bar"}));
      expect(s.tasks.list["foo"]).toHaveProperty("title", "bar");
    })
    test("can add tasks with just a human-readable message", function () {
      const s = reducers(initialState, addTask({id: "foo", message: "bar"}));
      expect(s.tasks.list["foo"]).toHaveProperty("message", "bar");
    })
    test("can update a task's status", function () {
      let s = reducers(initialState, addTask({id: "foo", title: "bar"}));
      s = reducers(s, updateTask({id: "foo", status: "success"}));
      expect(s.tasks.list["foo"]).toHaveProperty("title", "bar");
      expect(s.tasks.list["foo"]).toHaveProperty("status", "success");
    })    
    test("can update a task that has not been added", function () {
      let s = reducers(initialState, updateTask({id: "foofoo", status: "success"}));
      expect(s.tasks.list["foofoo"]).toHaveProperty("status", "success");
    })
    test("can remove task", function () {
      let s = reducers(initialState, addTask({id: "foo"}));
      s = reducers(s, addTask({id: "bar"}));
      s = reducers(s, removeTask("bar"));
      expect(s.tasks.list).toEqual(({foo:{title: "foo", status: "pending"}}));
    });
    
    test("doesn't crash if id is acidentally duplicated", function () {
      let s = reducers(initialState, addTask({id: "foo"}));
      s = reducers(s, addTask({id: "foo"}));
      expect(s.tasks.list).toEqual(({foo:{title: "foo", status: "pending"}}));
    });
  })
})
