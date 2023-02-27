
import {AbortError, HTTPError, FileError} from ".";

describe("FileError", ()=>{

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

  it("has proper toString() formatting",()=>{
    let str = "Error from foo.js : some info"
    let e = new FileError("foo.js", "some info");
    expect(e.toString()).toEqual(str);
    expect(`${e}`).toEqual(str);
  })
})

describe("HTTPError", ()=>{

  it("create new HTTPError()", function(){
    const e = new HTTPError(404, "Not Found");
    expect(e).toHaveProperty("code", 404);
    expect(e).toHaveProperty("message", "Not Found");
  });
  it("can be wrapped in FileError()", function(){
    const e = new FileError("foo.js", new HTTPError(404, 'Not Found'));
    expect(e).toHaveProperty("sourceFile", "foo.js");
    expect(e).toHaveProperty("code", 404);
    expect(e).toHaveProperty("message", "Not Found");
  })
})


describe("AbortError", ()=>{
  it("creates an acceptable AbortError", ()=>{
    const e = new AbortError();
    expect(e.name).toEqual("AbortError");
    expect(e.toString()).toMatch(/AbortError: .+/);
  });
  it("picks up a custom message", ()=>{
    const e = new AbortError("Fetch is aborted");
    expect(e.toString()).toMatch("AbortError: Fetch is aborted");
  });
})