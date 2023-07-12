

import {expectSaga, testSaga} from "redux-saga-test-plan";
import * as matchers from 'redux-saga-test-plan/matchers';

import writeToFile from "writeToFile";

import {handleDownloads, schedule_downloads, REQUEST_DOWNLOAD, do_download, DO_DOWNLOAD} from "./handleDownloads";
import { reducers } from "..";
import { SET_DEPENDENCIES, setDependencies, SET_CACHED_FILE, isCached, getRequiredFiles, getOtherSize, getOtherFiles, getFiles, setHash} from "./actions";
import { makeFileRef } from "./_mock_fileRef";
import { info } from "../logs";

let state, requests, dispatchs;

beforeEach(()=>{
  state = reducers(undefined, setDependencies(
    "items",
    {
      "/tmp/bar.mp4": makeFileRef("bar.mp4", {hash:"yyyyyy"}),
      "/tmp/foo.png": makeFileRef("foo.png"),
    },
  ));
  requests = [
    {type:REQUEST_DOWNLOAD, src:"gs://example.com/foo.png", dest:"/tmp/foo.png", hash:"xxxxxx"},
    {type:REQUEST_DOWNLOAD, src:"gs://example.com/bar.mp4", dest:"/tmp/bar.mp4", hash:"yyyyyy"}

  ];
  dispatchs = [
    {type: SET_CACHED_FILE, file:"/tmp/foo.png", hash:"xxxxxx"},
    {type: SET_CACHED_FILE, file:"/tmp/bar.mp4", hash:"yyyyyy"}
  ]
})

describe("schedule_downloads", ()=>{
  test("downloads files", ()=>{
    return expectSaga(schedule_downloads)
    .withReducer(reducers, state)
    .provide([
      [matchers.call.fn(writeToFile), undefined]
    ])
    .put(requests[0])
    .dispatch(dispatchs[0])
    .put(requests[1])
    .dispatch(dispatchs[1])
    .run();
  });
  test("ends when list has been downloaded", ()=>{
    const ref = makeFileRef("foo.png")
    testSaga(schedule_downloads).next()
    .select(getRequiredFiles).next([])
    .select(getOtherFiles).next(["/tmp/foo.png"])
    .select(getFiles).next({"/tmp/foo.png": ref})
    .put({
      type: REQUEST_DOWNLOAD, 
      dest: "/tmp/foo.png", 
      src:ref.src, 
      hash: ref.hash
    }).next()
    .take(SET_CACHED_FILE).next(setHash("/tmp/foo.png", ref.hash))
    .isDone();
  })
  test("handle dispatch from previously cancelled request", ()=>{
    const ref = makeFileRef("foo.png")
    testSaga(schedule_downloads).next()
    .select(getRequiredFiles).next([])
    .select(getOtherFiles).next(["/tmp/foo.png"])
    .select(getFiles).next({"/tmp/foo.png": ref})
    .put({ type: REQUEST_DOWNLOAD, dest: "/tmp/foo.png", src:ref.src, hash: ref.hash}).next()
    .take(SET_CACHED_FILE).next(setHash("/tmp/bar.mp4", "yyyyyy"))
    .take(SET_CACHED_FILE).next(setHash("/tmp/foo.png", ref.hash))
    .isDone();
  })
})

describe("do_download", ()=>{
  test("downloads one file", ()=>{
    testSaga(do_download).next()
    .take(REQUEST_DOWNLOAD).next(requests[0])
    .select(isCached, requests[0].dest, requests[0].hash).next(false)
    .put(info(DO_DOWNLOAD, `Téléchargement de foo.png`)).next()
    .call(writeToFile, requests[0].src, requests[0].dest).next()
    .put(dispatchs[0]).next()
    .finish()
    .isDone()
  })
  test("downloads every REQUEST actions", ()=>{
    testSaga(do_download).next()
    .take(REQUEST_DOWNLOAD).next(requests[0])
    .select(isCached, requests[0].dest, requests[0].hash).next(false)
    .put(info(DO_DOWNLOAD, `Téléchargement de foo.png`)).next()
    .call(writeToFile, requests[0].src, requests[0].dest).next()
    .put(dispatchs[0]).next()
    .take(REQUEST_DOWNLOAD).next(requests[1])
    .select(isCached, requests[1].dest, requests[1].hash).next(false)
    .put(info(DO_DOWNLOAD, `Téléchargement de bar.mp4`)).next()
    .call(writeToFile, requests[1].src, requests[1].dest).next()
    .put(dispatchs[1]).next()
    .finish()
    .isDone()
  })
  test("skips downloads that have been fetched cached", ()=>{
    //Happens only in rare cases when download is en-route when request is made
    testSaga(do_download).next()
    .take(REQUEST_DOWNLOAD).next(requests[0])
    .select(isCached, requests[0].dest, requests[0].hash).next(true)
    .put(dispatchs[0]).next()
    .finish()
    .isDone()
  });

  test("handles errors", ()=>{
    const e = new Error("Unsupported response : foo");
    testSaga(do_download).next()
    .take(REQUEST_DOWNLOAD).next(requests[0])
    .select(isCached, requests[0].dest, requests[0].hash).next(false)
    .put(info(DO_DOWNLOAD, `Téléchargement de foo.png`)).next()
    .call(writeToFile, requests[0].src, requests[0].dest).throw(e)
    .put({type: DO_DOWNLOAD, error: e}).next()
    .isDone()
  })
})

describe("handleDownloads saga", ()=>{
  test("fire schedule_downloads on new action", ()=>{
    return expectSaga(handleDownloads)
    .withReducer(reducers)
    .provide([
      [matchers.fork.fn(do_download), undefined],
      [matchers.fork.fn(schedule_downloads), undefined]
    ])
    .dispatch({type:SET_DEPENDENCIES, list:{}})
    .fork(schedule_downloads, {type:SET_DEPENDENCIES, list:{}})
    .silentRun();
  });
  test("immediately try to get missing files", ()=>{
    testSaga(handleDownloads).next()
    .fork(do_download).next()
    .call(schedule_downloads).next()
    .takeLatest(SET_DEPENDENCIES, schedule_downloads).next()
    .finish()
    .isDone();
  })
  test("one-time run", ()=>{
    return expectSaga(handleDownloads)
    .withReducer(reducers, state)
    .provide([
      [matchers.call.fn(writeToFile), undefined]
    ])
    .put(requests[0])
    .call.fn(writeToFile, "gs://example.com/foo.png", "/tmp/foo.png")
    .put(dispatchs[0])
    .put(requests[1])
    .call.fn(writeToFile, "gs://example.com/bar.mp4", "/tmp/bar.mp4")
    .put(dispatchs[1])
    .silentRun()
    .then(result=>{
      expect(result.storeState.files).toMatchSnapshot()
    });
  })

  test("cancels next downloads if a new action is fired", ()=>{
    let p =  new Promise((resolve)=>{setTimeout(resolve, 10)});
    return expectSaga(handleDownloads)
    .withReducer(reducers, state)
    .provide([
      [matchers.call.fn(writeToFile), p]
    ])
    .call(schedule_downloads)
    .delay(5)
    .call(writeToFile, "gs://example.com/foo.png", "/tmp/foo.png")
    .dispatch(setDependencies("config", {"/tmp/foo.jpg": makeFileRef("foo.jpg")}))
    .call(writeToFile, "gs://example.com/bar.mp4", "/tmp/bar.mp4")
    .call(writeToFile, "gs://example.com/foo.jpg", "/tmp/foo.jpg")
    .silentRun(20)
    .then(result=>{
      expect(result.effects.call).toHaveLength(1)//sagaWrapper call is not caught
      expect(result.storeState.files).toMatchSnapshot()
    })
  })
})