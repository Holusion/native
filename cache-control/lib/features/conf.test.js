'use strict';
jest.mock("../path");
import fsMock from "filesystem";
import { testSaga, expectSaga } from 'redux-saga-test-plan';

import { setDefaultTarget, setPlayControl, setProjectName, setPurge, setSlidesControl, setPasscode, setConf, actions, action_strings, getConf, confFile, getWatch, setWatch, getProjectName } from "./conf";
import {reducers} from ".";
import { select } from "redux-saga/effects";
import { saveFile } from "../readWrite";

describe("actions", ()=>{
  test("exports an object of actions", ()=>{
    expect(typeof actions).toEqual("object");
    expect(action_strings).not.toHaveLength(0);
    expect(Object.keys(actions)).toHaveLength(action_strings.length);
    for(let k in actions){
      expect(actions[k]).toEqual(k);
    }
  })
})

describe("conf reducer", function () {
  const initialState = reducers(undefined, {});
  const initialStateCopy = Object.assign({}, initialState);
  afterEach(function () {
    //Be sure state is never mutated, because const doesn't ensure this.
    expect(initialState).toEqual(initialStateCopy);
  })
  test("setConf() / getConf()", ()=>{
    let c = {projectName: "foo", slides_control: "none"};
    const s = reducers(initialState, setConf(c));
    expect(getConf(s)).toEqual(expect.objectContaining(c));
  })
  test("setConf() ignore errors", ()=>{
    expect(reducers(initialState, setConf({error: new Error("Booh")}))).toHaveProperty("conf", initialState.conf);
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
  test("can lock projectName", function(){
    let warnMock = jest.spyOn(global.console, "warn");
    warnMock.mockImplementationOnce(()=>{});
    let init = Object.assign({}, initialState, {conf: Object.assign({}, initialState.conf, {configurableProjectName: false})})
    let state = reducers(init, setProjectName("foo"));
    expect(state).toHaveProperty("conf", expect.objectContaining({projectName: undefined}));
    expect(warnMock).toHaveBeenCalled();
  })
  test("projectName defaults to editable", function(){
    let state = reducers(initialState, setProjectName("foo"));
    expect(state.conf).toHaveProperty("projectName", "foo");
  })
  test("projectName getter", ()=>{
    let state = reducers(initialState, setProjectName("bar"));
    expect(getProjectName(state)).toEqual("bar");
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

  test("watch defaults to true", ()=>{
    expect(getWatch(initialState)).toBe(true);
  })
  test("watch can be changed to false", ()=>{
    let state = reducers(initialState, setWatch(false));
    expect(getWatch(state)).toBe(false);
  })
});
