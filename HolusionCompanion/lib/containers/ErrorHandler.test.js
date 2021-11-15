import React from "react";
import { ErrorHandler, withErrorHandler } from "./ErrorHandler";

import { render, fireEvent, act } from '@testing-library/react-native'

function Err(props){
  throw new Error("Error message");
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
    test("catch errors in children", function(){
      let C = withErrorHandler(Err);
      let res = render(<C/>);
      expect(res.queryByTestId("errorHandler-title")).toBeTruthy();
      expect(res.getByTestId("errorHandler-message")).toHaveTextContent("Error message");
      expect(res.getByTestId("errorHandler-stack")).toHaveTextContent("at Err");
    });
  })

})