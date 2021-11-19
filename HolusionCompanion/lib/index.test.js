
//Simply check if index can be imported
import * as m from "./index";

describe("main module", function(){
  it("has expected properties", function(){
    expect(Object.keys(m)).toMatchSnapshot();
  });
})