import React from "react";

import { render, fireEvent, act } from '@testing-library/react-native'

jest.mock("./ObjectLink",()=>(()=> null));

import Markdown from "./Markdown";


describe("<Markdown>", ()=>{
  test("handle images", ()=>{
    const res = render(<Markdown>![alt text](file://path/to/foo.png)</Markdown>)
    expect(res.toJSON()).toMatchSnapshot();
  })
  test("handle links", ()=>{
    const res = render(<Markdown>[text](foo)</Markdown>)
    expect(res.toJSON()).toMatchSnapshot();
  })
})