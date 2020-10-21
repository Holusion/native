jest.mock("../path");
import fsMock from "filesystem";

jest.mock('../readWrite');
import {loadFile, saveFile, lock} from "../readWrite";

import { getCachedHash, getCacheFiles, CacheStage } from "."

describe("cache", function(){
  let files;
  beforeAll(()=>{
    lock.acquire.mockImplementation((name, cb)=> cb());
  })
  beforeEach(()=>{
    files = {"cache.json": JSON.stringify({ }, null, 2)};
    loadFile.mockReset();
    loadFile.mockImplementation((name)=> {
      if(!files[name]){
        let e = new Error("No such file or directory");
        e.code = "ENOENT";
        return Promise.reject(e);
      }
      return Promise.resolve(files[name]);
    });
    saveFile.mockReset();
    saveFile.mockImplementation((name, data)=>{
      files[name] = data;
      return Promise.resolve();
    });
  });

  describe("getCacheFiles()", function(){

    it("don't throw if file doesn't exist", async()=>{
      const e = new Error("Error ENOENT : no such file or directory");
      e.code = "ENOENT";
      loadFile.mockImplementationOnce(()=>Promise.reject(e));
      await expect(getCacheFiles()).resolves.toEqual(new Map([
        ["/tmp/storage/cache.json", true],
        ["/tmp/storage/data.json", true],
        ["/tmp/storage/conf.json", true],
      ]));
    });
    it("throw if file isn't readable", async()=>{
      const e = new Error("Error EACCESS : user doesn't have permission to read file");
      e.code = "EACCESS";
      loadFile.mockImplementationOnce(()=>Promise.reject(e));
      await expect(getCacheFiles()).rejects.toThrow(Error);
    });
    it("throw if JSON  is invalid", async ()=>{
      loadFile.mockImplementationOnce(()=>Promise.resolve(JSON.parse("foo{is invalid}")));
      await expect(getCacheFiles()).rejects.toThrow(Error);
    });
  })


  describe("getCachedHash()", function(){
    let warnMock;
    beforeAll(()=>{
      warnMock = jest.spyOn(global.console, "warn");
    })
    afterEach(()=>{
      warnMock.mockReset();
    })
    afterAll(()=>{
      warnMock.mockRestore();
    })

    it("don't throw if cache file is invalid", async ()=>{
      warnMock.mockImplementationOnce(()=>{});
      loadFile.mockImplementationOnce(()=>Promise.resolve("some invalid JSON"));
      await expect(getCachedHash("foo")).resolves.toBeUndefined();
      expect(warnMock).toHaveBeenCalledTimes(1);
    });
    it("will match data files even if cache.json has an error", async() =>{
      warnMock.mockImplementationOnce(()=>{});
      loadFile.mockImplementationOnce(()=>Promise.resolve("[]some invalid JSON"));
      await expect(getCachedHash("/tmp/storage/data.json")).resolves.toBe(true);
      expect(warnMock).toHaveBeenCalledTimes(1);
      warnMock.mockRestore();
    });

    it("will match cached files", async() =>{
      loadFile.mockImplementationOnce(()=>Promise.resolve(JSON.stringify({"/something/bar.mp4":"xxxxxxxx"})));
      await expect(getCachedHash("/something/bar.mp4")).resolves.toBe("xxxxxxxx");
    });
    it("will return null if file is not cached", async() =>{
      loadFile.mockImplementationOnce(()=>Promise.resolve(JSON.stringify({items: {"/something/bar.mp4":"xxxxxxxx"}})));
      await expect(getCachedHash("/something/foofoo.mp4")).resolves.toBeUndefined();
    });
  });
})
