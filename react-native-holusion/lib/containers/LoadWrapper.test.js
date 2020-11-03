import React from "react";
import {Text} from "react-native";

import { render, fireEvent, act } from '@testing-library/react-native'

import { Provider } from "react-redux";
import { createStore } from "redux";
import { INITIAL_LOAD, reducers } from "@holusion/cache-control";

import { RequiredLoadWrapper } from "./LoadWrapper";


function doWrap(initialState, children){
  const store = createStore(reducers, initialState);
  return render(<Provider store={store}>
    <RequiredLoadWrapper>
      {children}
    </RequiredLoadWrapper>
  </Provider>)
}
describe("<RequiredLoadWrapper>", ()=>{
  test("uses store state (not loaded)", ()=>{
    let res = doWrap(undefined, <Text>Foo</Text>);
    expect(res.queryByText("Foo")).not.toBeTruthy();
  })
  test("uses store state (initial load)", ()=>{
    let res = doWrap(reducers(undefined, {type:INITIAL_LOAD}), <Text>Foo</Text>);
    expect(res.getByText("Foo")).toBeTruthy();
  })
  test("blocks until required files are fetched", ()=>{
    let res = doWrap(reducers(undefined, {type:INITIAL_LOAD, files:{
      "cache": {
      },
        "configFiles": [],
        "itemFiles": [
          "/tmp/foo.png",
        ],
        "list": {
          "/tmp/foo.png": {
            "contentType": "image/png",
            "hash": "xxxxxx",
            "name": "foo.png",
            "size": 16,
            "src": "gs://example.com/foo.png",
          },
        },
    }}), <Text>Foo</Text>);
    expect(res.queryByText("Foo")).not.toBeTruthy();
  })
  test("don't block for non-required files", ()=>{
    let res = doWrap(reducers(undefined, {type:INITIAL_LOAD, files:{
      "cache": {
      },
        "configFiles": [],
        "itemFiles": [
          "/tmp/bar.mp4",
        ],
        "list": {
          "/tmp/foo.png": {
            "contentType": "video/mp4",
            "hash": "xxxxxx",
            "name": "bar.mp4",
            "size": 16,
            "src": "gs://example.com/bar.mp4",
          },
        },
    }}), <Text>Foo</Text>);
    expect(res.getByText("Foo")).toBeTruthy();
  })
})