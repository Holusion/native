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
  })
})