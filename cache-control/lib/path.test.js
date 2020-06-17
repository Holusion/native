import {storagePath, mediasPath, setBasePath, filename, createStorage } from "./path";

import fsMock from "filesystem";

describe("path", function(){
  it("throws if setBasePath has not been called", function(){
    expect(()=>storagePath()).toThrow(Error);
  })
  describe("setBasePath()", function(){
    it("throws if path is not a string", function(){
      expect(()=>setBasePath(undefined)).toThrow(Error);
    })
    it("throws if path is an empty string", function(){
      expect(()=>setBasePath("")).toThrow(Error);
    })
  });

  it("set base path for other functions", function(){
    setBasePath("/path/to/foo");
    expect(storagePath()).toEqual("/path/to/foo/storage");
    expect(mediasPath()).toEqual("/path/to/foo/medias");
  })

  it("strip trailing slash", function(){
    setBasePath("/path/to/foo/")
    expect(storagePath()).toEqual("/path/to/foo/storage");
    expect(mediasPath()).toEqual("/path/to/foo/medias");
  })

  describe("filename", ()=>{
    it("expects path to be a string", function(){
      expect(()=>filename(undefined)).toThrow(Error);
    })
  })
  describe("createStorage", function(){
    it("create storage directories", async ()=>{
      setBasePath("/something/something");
      await createStorage();
      expect(fsMock.mkdir).toHaveBeenCalledWith("/something/something/storage");
      expect(fsMock.mkdir).toHaveBeenCalledWith("/something/something/medias");
    })
  })
})