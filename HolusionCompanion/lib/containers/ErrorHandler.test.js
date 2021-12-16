import React from "react";
import {Text} from "react-native";
import { ErrorHandler, withErrorHandler } from "./ErrorHandler";

import { render, fireEvent, act } from '@testing-library/react-native'

function Err(props){
  throw new Error("Error message");
}
function Ok({message="OK"}){
  return <Text testID="OK">{message}</Text>;
}


describe("Error Boundaries", function(){
  let consoleMock;
  beforeEach(()=>{
    consoleMock = jest.spyOn(global.console, "error");
    consoleMock.mockImplementation(()=>{});
  });
  afterEach(()=>{
    consoleMock.mockRestore();
  })

  describe("ErrorHandler", function(){
    test("renders child component", function(){
      let res = render(<ErrorHandler><Ok/></ErrorHandler>);
      expect(res.queryByTestId("OK")).toBeTruthy();
    });
    test("render children", function(){
      let res = render(<ErrorHandler>
        <Ok/>
        <Ok/>
      </ErrorHandler>);
      expect(res.queryAllByTestId("OK")).toHaveProperty("length", 2);
    });
    test("catch errors in children", function(){
      let res = render(<ErrorHandler>
        <Err></Err>
      </ErrorHandler>);
      expect(res.queryByTestId("errorHandler-title")).toBeTruthy();
      expect(res.getByTestId("errorHandler-message")).toHaveTextContent("Error message");
      expect(res.getByTestId("errorHandler-stack")).toHaveTextContent("at Err");
    });
  });
  
  describe("withErrorHandler", function(){
    test("renders original component", function(){
      let C = withErrorHandler(Ok);
      let res = render(<C message="foo" />);
      let comp = res.queryByTestId("OK");
      expect(comp).toBeTruthy();
      expect(comp).toHaveTextContent("foo");
    });
    test("catch errors in children", function(){
      let C = withErrorHandler(Err);
      let res = render(<C/>);
      expect(res.queryByTestId("errorHandler-title")).toBeTruthy();
      expect(res.getByTestId("errorHandler-message")).toHaveTextContent("Error message");
      expect(res.getByTestId("errorHandler-stack")).toHaveTextContent("at Err");
    });
  });

});