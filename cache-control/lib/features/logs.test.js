'use strict';
import {reducers} from ".";
import {info, getLogs, getErrors, getError, warn, error} from "./logs";
import { SET_DATA } from "./data";
import { setActive } from "./products";


const initialState = reducers(undefined, {});

describe("errors", ()=>{
  let e, s;
  beforeEach(()=>{
    e = new Error("Hello");
    s = reducers(initialState, {error: e, type: SET_DATA});
  })
  test("log a line", ()=>{
    expect(getLogs(s)).toHaveLength(1);
    expect(getLogs(s)[0]).toEqual(expect.objectContaining({
      severity: "error", 
      message: e.message, 
      name: SET_DATA,
    }));
  })

  test("get active errors", ()=>{
    expect(getErrors(s)).toHaveLength(1);
    expect(getErrors(s)[0]).toMatchSnapshot({
      id: expect.any(Number),
      timestamp: expect.any(Date),
      context: expect.stringMatching("")
    });
  })
  
  test("get error by name", ()=>{
    expect(getError(s, SET_DATA)).toMatchSnapshot({
      id: expect.any(Number),
      timestamp: expect.any(Date),
      context: expect.stringMatching("")
    })
  })

  test("clear action error", ()=>{
    s = reducers(s, {type: SET_DATA,data: {foo:"bar"}});
    expect(getErrors(s)).toHaveLength(0);
  })

  test("handle setActive() actions", ()=>{
    s = reducers(s, setActive("foo"));
    expect(getLogs(s)[1]).toEqual(expect.objectContaining({
      message: "Connexion à foo",
      name: "SET_ACTIVE_PRODUCT",
      severity: "info",
      timestamp: expect.any(Date),
    }));
  })
  test("Allow custom error type", ()=>{
    let e = new Error("Hello");
    const s = reducers(initialState, {error: e, type: "FOO"});
    expect(getLogs(s)).toHaveProperty("length", 1);
    expect(getLogs(s)[0]).toEqual(expect.objectContaining({severity: "error", message: e.message, name: "FOO"}));
  });
  test("Allow custom context", ()=>{
    let e = new Error("Hello");
    e.context = "At some point";
    const s = reducers(initialState, {error: e, type: "FOO"});
    expect(getLogs(s)).toHaveProperty("length", 1);
    expect(getLogs(s)[0]).toEqual(expect.objectContaining({
      severity: "error", 
      message: e.message, 
      name: "FOO",
      context: "At some point",
    }));

  })
})


test("Cap logs at 100 lines", ()=>{
  let s = initialState;
  for (let i=0; i <110; i++){
    s = reducers(s, info(`Hello ${i}`));
  }
  let lines = getLogs(s);
  expect(lines).toHaveLength(100);
  expect(lines[0]).toHaveProperty("message", `Hello 10`);
})
test("keeps referenced errors when it overflows", ()=>{
  let s = initialState;
  s = reducers(s, {type: SET_DATA, error: new Error(`Something Wrong`)});
  for (let i=0; i <110; i++){
    s = reducers(s, info(`Hello ${i}`));
  }
  let lines = getLogs(s);
  expect(lines).toHaveLength(101);
  expect(lines[0]).toHaveProperty("message", `Something Wrong`);
})

test("can provide just a message to info()", ()=>{
  let s = reducers(initialState, info(`Hello World`));
  expect(getLogs(s)[0]).toEqual(expect.objectContaining({
    name: "INFO",
    severity: "info",
    message: "Hello World"
  }))
});

test("can provide custom log name", ()=>{
  let s = reducers(initialState, info("Foo", `Hello World`));
  expect(getLogs(s)[0]).toEqual(expect.objectContaining({
    name: "Foo",
    severity: "info",
    message: "Hello World"
  }))
})

test("can provide context", ()=>{
  let s = reducers(initialState, info("Foo", `Hello World`, "some context"));
  expect(getLogs(s)[0]).toEqual(expect.objectContaining({
    name: "Foo",
    severity: "info",
    message: "Hello World",
    context: "some context",
  }))
})
test("log warnings", ()=>{
  let s = reducers(initialState, warn("FOO", "Hello"));
  s = reducers(s, warn("World"));
  let lines = getLogs(s);
  expect(lines).toHaveLength(2);
  expect(lines[0]).toEqual(expect.objectContaining({
    name: "FOO",
    severity: "warn",
    message: "Hello"
  }))

  expect(lines[1]).toEqual(expect.objectContaining({
    name: "WARN",
    severity: "warn",
    message: "World"
  }))
})
test("log errors", ()=>{
  let s = reducers(initialState, error("FOO", "Hello"));
  s = reducers(s, error("World"));
  let lines = getLogs(s);
  expect(lines).toHaveLength(2);
  expect(lines[0]).toEqual(expect.objectContaining({
    name: "FOO",
    severity: "error",
    message: "Hello"
  }))
  expect(lines[1]).toEqual(expect.objectContaining({
    name: "ERROR",
    severity: "error",
    message: "World"
  }))
})

describe("serialize message", ()=>{
  class Foo{
    bar(){}
    toString(){return `[object Foo]`}
  }
  
  [
    ["null", null, "null"],
    ["number", 10, "10"],
    ["object", {foo: "Some Data"}, `[object Object]`],
    ["class", new Foo(), `[object Foo]`],
  ].forEach(([msg, src, res])=>{
    test(msg, ()=>{
      let s = reducers(initialState, info(src));
      expect(typeof getLogs(s)[0].message).toBe("string");
      expect(getLogs(s)[0].message).toEqual(res);
    })
  })
})
