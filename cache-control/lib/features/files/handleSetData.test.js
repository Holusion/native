
import { expectSaga, testSaga } from 'redux-saga-test-plan';
import {setData} from "../data";
import {SET_DEPENDENCIES} from "./actions";
import {handleSetData} from "./handleSetData";
import {makeFileRef} from "./_mock_fileRef";

describe("handleSetData()", ()=>{
  test("Takes a setData() action as argument with a Map of files", ()=>{
    let files = new Map([["/tmp/foo.png", makeFileRef("foo.png")]]);
    testSaga(handleSetData, setData({
      items:{foo:{image:"/tmp/foo.png"}}, 
      files
    }))
    .next()
    .put({
      type: SET_DEPENDENCIES, 
      list: {"/tmp/foo.png": makeFileRef("foo.png")},
      name: "items" 
    })
    .next()
    .isDone();
  })
  test("Takes a setData() action as argument with an object of files", ()=>{
    let files = {"/tmp/foo.png": makeFileRef("foo.png")};
    testSaga(handleSetData, setData({
      config:{image:"/tmp/foo.png"}, 
      files
    }))
    .next()
    .put({
      type: SET_DEPENDENCIES, 
      list: {"/tmp/foo.png": makeFileRef("foo.png")},
      name: "config" 
    })
    .next()
    .isDone();
  });
  test("ignore setData() with error", ()=>{
    let files = {"/tmp/foo.png": makeFileRef("foo.png")};
    testSaga(handleSetData, setData({
      error: new Error("Booh")
    }))
    .next()
    .isDone()
  });
})
