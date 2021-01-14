jest.mock("./path");
import {storagePath} from "./path";
import fs from "filesystem";

import {FileError} from "./errors";
import {loadFile, saveFile} from "./readWrite";

describe("files readWrite", ()=>{
  it("ensure proper mocks", function(){
    storagePath.mockImplementationOnce(()=>"/tmp/rn-holusion-tests")
    expect(storagePath()).toEqual("/tmp/rn-holusion-tests");
    storagePath.mockImplementationOnce(()=>"/foo");
    expect(storagePath()).toEqual("/foo");
  });


  it("properly locks read/write", function(){
    saveFile("foo.txt", "hello world synchronized");
    let pr = loadFile("foo.txt");
    return pr.then((data)=>{
      expect(data).toEqual("hello world synchronized")
    });
  });
  it("Throws a formatted FileError", ()=>{
    fs.atomicWrite.mockImplementationOnce(()=>{
      let e = new Error("Permission denied");
      e.code = "EACCESS";
      return Promise.reject(e);
    });
    return expect(saveFile("foo.txt")).rejects.toThrow(FileError);
  })


});