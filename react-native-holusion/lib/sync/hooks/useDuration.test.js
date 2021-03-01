import React, { useEffect } from "react";

import {render, act, cleanup} from '@testing-library/react-native'
import { NavigationContainer, ServerContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import {createStore} from "redux";
import {reducers} from "@holusion/cache-control";
import { useDuration } from "./useDuration";
import { View, Text } from "native-base";

const Stack = createStackNavigator();

function DefaultWrapper({d}){
    useDuration(d);
    return <Text testID="Foo">{d}</Text>;
}


describe("useDuration", ()=>{
  beforeEach(()=>{
    jest.useFakeTimers();
  })
  
  function doWrap({Home, Wrapper=DefaultWrapper}){
    return render(<NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name={"Foo"} component={Wrapper}/>
        <Stack.Screen name={"Home"} component={Home}/>
      </Stack.Navigator>
    </NavigationContainer>);
  }

  it("does nothing if duration is not set", async ()=>{
    let n;
    function Home({navigation}){
      n = navigation;
      return <View testID="Home"></View>;
    }
    const res = doWrap({Home});
    expect(res.queryByTestId("Home")).toBeTruthy();
    expect(res.queryByTestId("Foo")).not.toBeTruthy();
    act(()=>{
      n.navigate("Foo");
    });
    expect(res.queryByTestId("Foo")).toBeTruthy();
    await act(async ()=>{
      jest.advanceTimersByTime(10);
    });
    expect(res.queryByTestId("Foo")).toBeTruthy();
  });

  it("goes back to previous page after duration ms elapsed", async ()=>{
    let n;
    function Home({navigation}){
      n = navigation;
      return <View testID="Home"></View>;
    }
    function Wrapper(){
      return <DefaultWrapper d={10}/>
    }
    const res = doWrap({Home, Wrapper});
    act(()=>{
      n.navigate("Foo");
    });
    expect(res.queryByTestId("Foo")).toBeTruthy();
    await act(async ()=>{
      jest.advanceTimersByTime(10);
    });
    expect(res.queryByTestId("Foo")).not.toBeTruthy();
  });
  
  it("does nothing if it can't go back", async ()=>{
    function Home(){
      useDuration(1);
      return <View testID="Home"></View>;
    }
    const res = doWrap({Home});
    await act(async ()=>{
      jest.advanceTimersByTime(1);
    });
    expect(res.queryByTestId("Home")).toBeTruthy();

  })
  
})