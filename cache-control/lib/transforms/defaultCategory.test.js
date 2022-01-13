'use strict';

import {defaultCategoryFactory} from "./defaultCategory";


describe("defaultCategoryFactory", function(){
  let factory;
  beforeAll(()=>{
    factory = defaultCategoryFactory("foo");
  })
  test("assigns category = id if undefined", function(){
    expect(factory({id: "bar"})).toEqual([{id: "bar", category: "bar"}, new Set()]);
  });
  test("keeps existing category", function(){
    expect(factory({id: "bar", category: "barbar"})).toEqual([{id: "bar", category: "barbar"}, new Set()]);
  })
})