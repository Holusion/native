'use strict';
import { setDefaultTarget, setPlayControl, setProjectName, setPurge, setSlidesControl, setPasscode } from "../actions";
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
  test('can configure default target product', function(){
    const state = reducers(initialState, setDefaultTarget("iris32-24"));
    expect(state.conf).toHaveProperty("default_target", "iris32-24");
  });
  test("can toggle purge switch", function(){
    let state = reducers(initialState, setPurge(true));
    expect(state.conf).toHaveProperty("purge_products", true);
    state = reducers(initialState, setPurge(false));
    expect(state.conf).toHaveProperty("purge_products", false);
  })
  test("can set play control method", function(){
    let state = reducers(initialState, setPlayControl("button"));
    expect(state.conf).toHaveProperty("play_control", "button");
    state = reducers(initialState, setPlayControl("none"));
    expect(state.conf).toHaveProperty("play_control", "none");
  });
  test("can set projectName", function(){
    let init = Object.assign({}, initialState, {conf: Object.assign({}, initialState.conf, {configurableProjectName: true})})
    let state = reducers(init, setProjectName("foo"));
    expect(state).toHaveProperty("conf", expect.objectContaining({projectName: "foo"}));
  })
  test("projectName defaults to read-only", function(){
    let warnMock = jest.spyOn(global.console, "warn");
    warnMock.mockImplementationOnce(()=>{});
    let state = reducers(initialState, setProjectName("foo"));
    expect(state.conf).toHaveProperty("projectName", undefined);
    expect(warnMock).toHaveBeenCalled();
  })
  
  test("passcode defaults to not-set", ()=>{
    expect(initialState.conf.passcode).not.toBeTruthy();
  })
  test("set passcode to null", ()=>{
    let state = reducers(initialState, setPasscode(null))
    expect(state.conf).toHaveProperty("passcode", null);
  })
  test("set passcode to 0000", ()=>{
    let state = reducers(initialState, setPasscode("0000"))
    expect(state.conf).toHaveProperty("passcode", "0000");
  })
});
