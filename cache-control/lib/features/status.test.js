
import {reducers} from ".";

import {INITIAL_LOAD, isLoaded, isConnected, setNetInfo} from "./status";
describe("status reducer", ()=>{
  test("initial_load is initialized to false", ()=>{
    expect(isLoaded(reducers(undefined, {}))).toBe(false);
  });
  test("status value defaults to true", ()=>{
    expect(isLoaded(reducers(undefined, {type:INITIAL_LOAD}))).toBe(true);
  })
})

describe("setNetInfo", ()=>{
  test("initially offline", ()=>{
    expect(isConnected(reducers(undefined, {}))).toBe(false);
  })
  test("can be brought online", ()=>{
    expect(isConnected(reducers(undefined, setNetInfo(true)))).toBe(true);
  })
  test("can be brought back offline", ()=>{
    expect(isConnected(reducers(undefined, setNetInfo(false)))).toBe(false);
  })
})