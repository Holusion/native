import React from "react";

import {render, act, cleanup} from '@testing-library/react-native'
import { createStackNavigator } from '@react-navigation/stack';
import { BaseView } from ".";

const Stack = createStackNavigator();


describe("<BaseView/>", ()=>{

  afterEach(()=>{
    cleanup();
  })
  test("render a minimal item", function(){
    let d = {
      title: "foo",
    }
    const res = render(<BaseView active={true} {...d}/>);
    expect(res.queryByText("foo")).toBeTruthy();
  });
  test("renders image + description", ()=>{
    const res = render(<BaseView active={true} title="Foo" image="http://example.com/foo.png" description="Hello World!"/>);
    expect(res.queryByTestId("image-content")).toBeTruthy();
    expect(res.queryByTestId("description-content")).toHaveTextContent("Hello World!");
  })
  test("renders full-width image when there is no description", ()=>{
    const res = render(<BaseView active={true} title="Foo" image="http://example.com/foo.png"/>);
    expect(res.queryByTestId("image-content")).toBeTruthy();
    expect(res.queryByTestId("description-content")).not.toBeTruthy();
  })
})