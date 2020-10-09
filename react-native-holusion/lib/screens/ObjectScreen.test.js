import React from "react";

import {render, act, cleanup} from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from "react-redux";

import {configureStore} from "../persistentStore";
import {ObjectScreen} from ".";
import { setData } from "../actions";

const Stack = createStackNavigator();


function doWrap({store, initialRouteName="Object", initialParams}){
  return render((<Provider store={store}>
    <NavigationContainer>
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen initialParams={initialParams} name={"Object"} component={ObjectScreen}/>
    </Stack.Navigator>
    </NavigationContainer>
  </Provider>))
}

describe("<ObjectScreen/>", ()=>{
  let store;

  beforeEach(()=>{
    store = configureStore();
    store.dispatch(setData({
      config:{
        video: "/path/to/foo.mp4",
        categories: [
          {name: "cat1", video:"/path/to/bar.mp4"}
        ]
      }, 
      items: {
        "item1": {video: "/path/to/baz.mp4"}
      }
    }));
  })
  afterEach(()=>{
    cleanup();
  })
  test("Render an error if requested ID is invalid", async ()=>{
    let res = doWrap({store, initialParams:{category:"cat1", id: "foo"}});
    await act(async ()=>{});
    expect(res.queryByTestId("object-not-found")).toBeTruthy();
  });
})