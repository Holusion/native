jest.mock("./path");
import {storagePath} from "./path";
import fs from "filesystem";

import {loadFile, saveFile, FileError} from "./readWrite";

describe("files readWrite", ()=>{
  it("ensure proper mocks", function(){
    storagePath.mockImplementationOnce(()=>"/tmp/rn-holusion-tests")
    expect(storagePath()).toEqual("/tmp/rn-holusion-tests");
    storagePath.mockImplementationOnce(()=>"/foo");
    expect(storagePath()).toEqual("/foo");
  });

  it("create new FileError()", function(){
    const e = new FileError("foo.js", "some message");
    expect(e).toHaveProperty("sourceFile", "foo.js");
    expect(e).toHaveProperty("message", "some message");
  })
  it("create new FileError() from Error", function(){
    let orig =new Error("some message");
    orig.code ="ENOENT";
    const e = new FileError("foo.js", orig);
    expect(e).toHaveProperty("sourceFile", "foo.js");
    expect(e).toHaveProperty("message", "some message");
    expect(e).toHaveProperty("code", "ENOENT");
  })

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