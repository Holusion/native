'use strict';
import { setNetInfo } from "../actions";
import reducers from ".";



describe("reducers", function () {
  const initialState = reducers(undefined, {});
  const initialStateCopy = Object.assign({}, initialState);
  afterEach(function () {
    //Be sure state is never mutated, because const doesn't ensure this.
    expect(initialState).toEqual(initialStateCopy);
  })
  describe("network", function () {
    test('network starts as offline', function () {
      expect(initialState).toHaveProperty("network");
      expect(initialState.network).toHaveProperty("status", "offline");
    })
    test("setNetInfo() changes network status", function () {
      const s = reducers(initialState, setNetInfo("online"));
      expect(s.network).toHaveProperty("status", "online");
    })
  });
})
