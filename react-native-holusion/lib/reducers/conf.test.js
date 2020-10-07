'use strict';
import { setSlidesControl } from "../actions";
import reducers from ".";



describe("conf reducer", function () {
  const initialState = reducers(undefined, {});
  const initialStateCopy = Object.assign({}, initialState);
  afterEach(function () {
    //Be sure state is never mutated, because const doesn't ensure this.
    expect(initialState).toEqual(initialStateCopy);
  })
  test('conf default', function () {
    expect(initialState).toHaveProperty("conf");
    expect(initialState.conf).toHaveProperty("slides_control","default");
  })
  test('can set slides_control to "buttons"', function(){
    const state = reducers(initialState, setSlidesControl("buttons"));
    expect(state.conf).toHaveProperty("slides_control", "buttons");
  })
  test('can reset slides_control to default', function(){
    const state = reducers(initialState, setSlidesControl("default"));
    expect(state.conf).toHaveProperty("slides_control", "default");
  })
});
