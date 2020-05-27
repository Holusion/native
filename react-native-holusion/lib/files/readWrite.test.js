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
  describe("loadFile()", function(){
    it("will throw Error with code == ENOENT", function(){
      storagePath.mockImplementationOnce(()=>"/foo");
      return expect(loadFile("data.xxx")).rejects.toThrow(expect.objectContaining({code: "ENOENT"}));
    })

  })
});