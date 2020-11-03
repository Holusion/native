
import {reducers} from ".";

import {INITIAL_LOAD, isLoaded, isConnected, setNetInfo, isSignedIn, SET_SIGNEDIN, setSignedIn} from "./status";
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

describe("isSignedIn", ()=>{
  test("setSignedIn can take a projectName", ()=>{
    expect(setSignedIn("foo")).toEqual({type: SET_SIGNEDIN, value: "foo"})
  })
  test("initialized to false", ()=>{
    expect(isSignedIn(reducers(undefined, {}))).toBe(false);
  })
  test("an empty action with SET_SIGNEDIN sets it to true", ()=>{
    expect(isSignedIn(reducers(undefined, {type:SET_SIGNEDIN}))).toBe(true);
  });
  test("an error resets signedIn to false", ()=>{
    let s = reducers(undefined, {type: SET_SIGNEDIN});
    expect(isSignedIn(reducers(s, {type:SET_SIGNEDIN, error:new Error("booh")}))).toBe(false);
  })
  
})

describe("setSignedIn", ()=>{
  test("handle errors", ()=>{
    let e = new Error("Foo");
    expect(setSignedIn(e)).toEqual({
      type: SET_SIGNEDIN,
      error: e,
    })
  })

  test("handle signed-in result", ()=>{
    expect(setSignedIn(true)).toEqual({
      type: SET_SIGNEDIN,
      value: true
    });
  })
})