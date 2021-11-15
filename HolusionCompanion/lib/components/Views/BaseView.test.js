import React from "react";

import {render, act, cleanup} from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { BaseView } from ".";

const Stack = createStackNavigator();


function doWrap(child){
  function Wrapper(){
    return <React.Fragment>{child}</React.Fragment>
  }
  return render(<NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name={"Home"} component={Wrapper}/>
    </Stack.Navigator>
  </NavigationContainer>)
}
describe("<BaseView/>", ()=>{
  test("render a minimal item", function(){
    let d = {
      title: "foo",
    }
    const res = doWrap(<BaseView active={true} {...d}/>);
    expect(res.queryByText("foo")).toBeTruthy();
  });
  test("renders image + description", ()=>{
    const res = doWrap(<BaseView active={true} title="Foo" image="http://example.com/foo.png" description="Hello World!"/>);
    expect(res.queryByTestId("image-content")).toBeTruthy();
    expect(res.queryByTestId("description-content")).toHaveTextContent("Hello World!");
  })
  test("renders full-width image when there is no description", ()=>{
    const res = doWrap(<BaseView active={true} title="Foo" image="http://example.com/foo.png"/>);
    expect(res.queryByTestId("image-content")).toBeTruthy();
    expect(res.queryByTestId("description-content")).not.toBeTruthy();
  })
})