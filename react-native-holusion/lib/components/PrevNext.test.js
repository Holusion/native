import React from "react";
import {Text} from "react-native";
import { render, fireEvent, act } from '@testing-library/react-native'

import {PrevNext} from ".";


describe("<PrevNext/>", ()=>{
  let prev, next;
  beforeEach(()=>{
    prev = jest.fn();
    next = jest.fn();
  });

  test("render a minimal item", function(){
    const res = render(<PrevNext prev={prev} next={next}/>);
    expect(res.queryByTestId("button-prev")).toBeTruthy();
    expect(res.queryByTestId("button-next")).toBeTruthy();
  });
  test("render children", function(){
    const res = render(<PrevNext prev={prev} next={next}><Text>Foo</Text></PrevNext>);
    expect(res.getByText("Foo")).toBeTruthy();
  });
  test("uses callback when user press prev", ()=>{
    const res = render(<PrevNext prev={prev} next={next}/>);
    let btn = res.queryByTestId("button-prev");
    expect(btn).toBeTruthy;
    fireEvent.press(btn);
    expect(prev).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  })
  test("uses callback when user press next", ()=>{
    const res = render(<PrevNext prev={prev} next={next}/>);
    let btn = res.queryByTestId("button-next");
    expect(btn).toBeTruthy;
    fireEvent.press(btn);
    expect(next).toHaveBeenCalledTimes(1);
    expect(prev).not.toHaveBeenCalled();
  });
})