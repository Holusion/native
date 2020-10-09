'use strict';
import { setConfig, setData, setItems } from "../actions";
import reducers from ".";



describe("reducers", function () {
  const initialState = reducers(undefined, {});
  const initialStateCopy = Object.assign({}, initialState);
  afterEach(function () {
    //Be sure state is never mutated, because const doesn't ensure this.
    expect(initialState).toEqual(initialStateCopy);
  })

  describe("data", function () {
    test("can set data", function () {
      const d = { items: { foo: { name: "foo", status: "bar" } }, projectName: "foo", selectedId: "foo", config: {} };
      const s = reducers(initialState, setData(d));
      expect(s.data).toHaveProperty("items", { foo: { name: "foo", status: "bar" } });
      expect(s.data).toHaveProperty("projectName", "foo");
      expect(s.data).toHaveProperty("selectedId", "foo");
    })
    test("can set only selected keys of data", function () {
      const d = { items: { foo: { name: "foo", status: "bar" } } };
      const s = reducers(initialState, setData(d));
      expect(s.data.items).toEqual(d.items);
      expect(s.data).toHaveProperty("config", {});
    })
    test("can set mutiple keys of data simultaneously", function () {
      const d = { 
        config: {video: "foo.mp4"},
        items: { foo: { name: "foo", status: "bar" } } 
      };
      const s = reducers(initialState, setData(Object.assign({}, d)));
      expect(s.data).toHaveProperty("items", d.items);
      expect(s.data).toHaveProperty("config", d.config);
    })

    test("can set data.items specifically", function(){
      let items = {foo: {name: "foo"}};
      const s = reducers(initialState, setItems(items));
      expect(s.data.config).toBe( initialState.data.config);
      expect(s.data.items).toEqual(items);
    });
    test("can set data.config specifically", function(){
      let config = {video: "foo.mp4"}
      const s = reducers(initialState, setConfig(config));
      expect(s.data.items).toBe( initialState.data.items);
      expect(s.data.config).toEqual(config);
    });
  })

})
