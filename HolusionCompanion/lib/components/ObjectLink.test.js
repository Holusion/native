import React from "react";
import {createStore} from "redux";
import { Provider } from "react-redux";
import { render, fireEvent, act, Text } from '@testing-library/react-native'

import {reducers, setData} from "@holusion/cache-control"

import {parseItem, useParsedLink} from "./ObjectLink";

describe("parseItem()", ()=>{
  test("parse an item from ID and data", ()=>{
    expect(parseItem({id: "foo", category: "bar"})).toEqual({screen: "bar", params: {id: "foo"}});
  })
  test("fill in  default category", ()=>{
    expect(parseItem({id: "foo"})).toEqual({screen: "Undefined", params: {id: "foo"}});
  })
})




describe("useParsedLink", ()=>{
  let store;
  function Dummy(props){
    const res = useParsedLink(props);
    return <Text testID="dummy">{JSON.stringify(res)}</Text>
  }
  beforeEach(()=>{
    store = createStore(reducers);
    store.dispatch(setData({items: {foo: {id:"foo", title: "Foo"}}}));
  })
  test("uses store", ()=>{
    const res = render(<Provider store={store}>
      <Dummy to="foo"/>
    </Provider>);
    expect(res.getByTestId("dummy")).toHaveTextContent(`{"screen":"Undefined","params":{"id":"foo"}}`)
  })
  test("links to 404 page when ID is not found", ()=>{
    const res = render(<Provider store={store}>
      <Dummy to="bar"/>
    </Provider>);
    expect(res.getByTestId("dummy")).toHaveTextContent(`{"screen":"404","params":{"id":"bar"}}`)
  })
  test("links to special pages", ()=>{
    const res = render(<Provider store={store}>
      <Dummy to="Settings"/>
    </Provider>);
    expect(res.getByTestId("dummy")).toHaveTextContent(`{"screen":"Settings","params":{}}`)
  })
  test("Pages have a higher priority than default links", ()=>{
    store.dispatch(setData({items: {Settings: {id:"Settings", title: "Foo"}}}));
    const res = render(<Provider store={store}>
      <Dummy to="Settings"/>
    </Provider>);
    expect(res.getByTestId("dummy")).toHaveTextContent(`{"screen":"Undefined","params":{"id":"Settings"}}`)
  })
})