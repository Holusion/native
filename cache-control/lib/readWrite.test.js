jest.mock("./path");
import {storagePath} from "./path";
import {loadFile} from "./readWrite";

describe("files readWrite", ()=>{
  it("ensure proper mocks", function(){
    storagePath.mockImplementationOnce(()=>"/tmp/rn-holusion-tests")
    expect(storagePath()).toEqual("/tmp/rn-holusion-tests");
    storagePath.mockImplementationOnce(()=>"/foo");
    expect(storagePath()).toEqual("/foo");
  });
});