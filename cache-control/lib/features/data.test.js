'use strict';
jest.mock("../path");

jest.mock("../WatchChanges");
import {WatchChanges as WatchChangesMock} from "../WatchChanges";

import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { 
  setData, saveData, watchChanges, createWatcher, SET_DATA, createWatchChannel,
  getItems, getItemsIds, getItemsArray,
} from "./data";
import {reducers} from ".";

import { getError } from "./logs";
import { setSignedIn } from "./status";
import { getWatch, setWatch } from "./conf";



describe("reducer", function () {
  const initialState = reducers(undefined, {});
  const initialStateCopy = Object.assign({}, initialState);
  afterEach(function () {
    //Be sure state is never mutated, because const doesn't ensure this.
    expect(initialState).toEqual(initialStateCopy);
  })

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
  test("can dispatch files with data", ()=>{
    const d = {
      config: {video: "foo.mp4"},
      files: new Map([["foo.mp4", {}]])
    }
    const s = reducers(initialState, setData(Object.assign({}, d)));
    expect(s.data).toHaveProperty("config", d.config);
  });
  test("ignore action with error", ()=>{
    const d = { config: {projectName: "foo"}, error: new Error("Foo") };
    const s = reducers(initialState, setData(d));
    expect(s.data).toBe(initialState.data);
  });

  test("getItems()", ()=>{
    const d = { items:{foo: {title: "Foo"}} };
    const s = reducers(initialState, setData(d));
    expect(getItems(s)).toEqual({foo: {title: "Foo"}});
  })  
  test("getItemIds()", ()=>{
    const d = { items:{foo: {title: "Foo"}} };
    const s = reducers(initialState, setData(d));
    expect(getItemsIds(s)).toEqual(["foo"]);
  })
  test("getItemArray()", ()=>{
    const d = { items:{foo: {title: "Foo"}} };
    const s = reducers(initialState, setData(d));
    expect(getItemsArray(s)).toEqual([{id:"foo", title: "Foo"}]);
  })
})

describe("setData()", ()=>{
  test("can take an error", ()=>{
    expect(setData({error: new Error("Baah")})).toEqual({
      type: SET_DATA,
      error: new Error("Baah")
    })
  })
})

describe("watchChanges", ()=>{
  const initialState = reducers(undefined, {});

  test("WatchChanges mock is an EventEmitter", (done)=>{
    //Requirement for other tests
    let wc = new WatchChangesMock();
    wc.on("dispatch", ()=>done());
    wc.emit("dispatch");
  });
  test("ignore setSignedIn if it reports an error", ()=>{
    testSaga(watchChanges, {error: new Error("Foo"), projectName: "foo"}).next()
    .isDone();
  })
  test("uses action from setSignedIn", ()=>{
    testSaga(watchChanges, setSignedIn("foo")).next()
    .select(getWatch).next(true)
    .call(createWatcher, "foo");
  })

  test("loop over WatchChanges events", ()=>{
    let wc = new WatchChangesMock();
    let p = expectSaga(watchChanges, setSignedIn("foo"))
    .provide([
      [matchers.call.fn(createWatcher), wc]
    ])
    .withReducer(reducers)
    .silentRun() //It should not stop before wc emits an error so it will timeout
    .then(result=>{
      expect(wc.watch).toHaveBeenCalledTimes(1);
      expect(wc.close).toHaveBeenCalledTimes(1);
      expect(result.storeState.data).toHaveProperty("config", {title: "file:///tmp/foo.png"});
    })
    
    wc.emit("dispatch", {config: {title: "file:///tmp/foo.png"}, files: {"file:///tmp/foo.png": {src: "gs://example.com/foo.png", size: 12, hash:"xxx"}}})
    return p;
  })

  test("can use WatchChanges.getOnce()", ()=>{
    let wc = new WatchChangesMock();
    let p = expectSaga(watchChanges, setSignedIn("foo"))
    .provide([
      [matchers.call.fn(createWatcher), wc]
    ])
    .withReducer(reducers, reducers(initialState, setWatch(false)))
    .silentRun() //It should not stop before wc emits an error so it will timeout
    .then(result=>{
      expect(wc.watch).toHaveBeenCalledTimes(0);
      expect(wc.getOnce).toHaveBeenCalledTimes(1);
      expect(wc.close).toHaveBeenCalledTimes(1);
      expect(result.storeState.data).toHaveProperty("config", {title: "file:///tmp/foo.png"});
    })
    
    wc.emit("dispatch", {config: {title: "file:///tmp/foo.png"}, files: {"file:///tmp/foo.png": {src: "gs://example.com/foo.png", size: 12, hash:"xxx"}}})
    return p;
  })

  test("Can cancel watcher", ()=>{
    let wc = new WatchChangesMock();
    let channel = createWatchChannel(wc);
    let saga = testSaga(watchChanges, setSignedIn("foo")).next()
    .select(getWatch).next(true)
    .call(createWatcher, "foo").next(wc)
    .call(createWatchChannel, wc, true).next(channel)
    .take(channel);

    expect(wc.close).not.toHaveBeenCalled();

    saga.finish()
    .isDone();

    expect(wc.close).toHaveBeenCalledTimes(1);
  })

  test("catch watch errors", ()=>{
    let e =new Error("Booh");
    let wc = new WatchChangesMock();
    let channel = createWatchChannel(wc);
    testSaga(watchChanges, setSignedIn("foo")).next()
    .select(getWatch).next(true)
    .call(createWatcher, "foo").next(wc)
    .call(createWatchChannel, wc, true).next(channel)
    .take(channel).next({error: e})
    .put({type: SET_DATA, error: e})
  })

  test("catch watcher errors (end-to-end)", ()=>{
    let wc = new WatchChangesMock();
    wc.watch.mockImplementationOnce(()=>{
      setTimeout(()=>{
        wc.emit("error", new Error("Booh"));
      }, 1);
    });
    let saga = expectSaga(watchChanges, setSignedIn("foo"))
    .provide([
      [matchers.call.fn(createWatcher), wc]
    ])
    .withReducer(reducers)
    .silentRun(10) //Will cancel the saga after 1ms
    return saga
    .then(result=>{
      expect(wc.watch).toHaveBeenCalledTimes(1);
      expect(wc.close).toHaveBeenCalledTimes(1);
      expect(getError(result.storeState, SET_DATA)).toEqual(expect.objectContaining({
        message: "Booh",
      }));
      expect(wc.close).toHaveBeenCalled();
    })
  })
})