jest.mock("./path");
import {storagePath} from "./path";

import {cleanup, getCachedHash, getCacheFiles, CacheStage} from "./cache"

import RNFSMock from "react-native-fs";
describe("cache", function(){
  beforeAll(()=>{
    storagePath.mockImplementation(() => "/some/path");
  })
  afterEach(()=>{
    jest.clearAllMocks();
  })

  describe("getCacheFiles()", function(){

    it("don't throw if file doesn't exist", async()=>{
      const e = new Error("Error ENOENT : file doesn't exists");
      e.code = "ENOENT";
      RNFSMock.readFile.mockImplementationOnce(()=>Promise.reject(e));
      await expect(getCacheFiles()).resolves.toEqual(new Map([
        ["/some/path/cache.json", true],
        ["/some/path/data.json", true],
        ["/some/path/conf.json", true],
      ]));
    });

    it("throw if JSON  is invalid", async ()=>{
      RNFSMock.readFile.mockImplementationOnce(()=>Promise.resolve("some invalid JSON"));
      await expect(getCacheFiles()).rejects.toThrow(Error);
    });
  })

  describe("cleanup()", function(){
    it("throws error with code == ENOENT if directory does not exist", ()=>{
      const e = new Error("Error ENOENT : file doesn't exists");
      e.code = "ENOENT";
      RNFSMock.readFile.mockImplementationOnce(()=>Promise.reject(e));
      return expect(cleanup()).rejects.toThrow(expect.objectContaining({code: "ENOENT"}));
    })
    it("reads cache file", async function(){
      RNFSMock.readFile.mockResolvedValue(JSON.stringify({
        local: {"/foo/cache.json": true}
      }))
      RNFSMock.readDir.mockResolvedValueOnce([
        { path: "/foo/cache.json", isDirectory: ()=> false }
      ])
      await expect(cleanup()).resolves.toEqual([[], ["/foo/cache.json"]]);
    })
  
    it("deletes stale files", async function(){
      RNFSMock.readFile.mockResolvedValue(JSON.stringify({
        local: {"/foo/cache.json": true}
      }))
      RNFSMock.readDir.mockResolvedValueOnce([
        { path: "/foo/cache.json", isDirectory: ()=> false },
        { path: "/foo/bar.mp4", isDirectory: ()=> false }
      ])
      RNFSMock.unlink.mockReset();
      await expect(cleanup()).resolves.toEqual([["/foo/bar.mp4"], ["/foo/cache.json"]]);
      expect(RNFSMock.unlink).toHaveBeenCalledTimes(1);
      expect(RNFSMock.unlink).toHaveBeenCalledWith("/foo/bar.mp4");
    })
  
    it("delete whole directories", async function(){
      RNFSMock.readFile.mockResolvedValue(JSON.stringify({
        local: {"/foo/cache.json": true}
      }));
      RNFSMock.readDir.mockResolvedValueOnce([
        { path: "/foo/cache.json", isDirectory: ()=> false },
        { path: "/foo/bar", isDirectory: ()=> true},
      ])
      await expect(cleanup()).resolves.toEqual([["/foo/bar"], ["/foo/cache.json"]]);
      expect(RNFSMock.readDir).toHaveBeenCalledTimes(1);
      expect(RNFSMock.unlink).toHaveBeenCalledTimes(1);
      expect(RNFSMock.unlink).toHaveBeenCalledWith("/foo/bar");
    })
    it("recurse in directories", async function(){
      RNFSMock.readFile.mockResolvedValue(JSON.stringify({
        local: {"/foo/bar/test1.mp4": true}
      }))
      RNFSMock.readDir.mockResolvedValueOnce([
        { path: "/foo/bar", isDirectory: ()=> true},
      ])
      RNFSMock.readDir.mockResolvedValueOnce([
        { path: "/foo/bar/test1.mp4", isDirectory: ()=> false},
        { path: "/foo/bar/test2.mp4", isDirectory: ()=> false},
      ])
      await expect(cleanup()).resolves.toEqual([["/foo/bar/test2.mp4"], ["/foo/bar/test1.mp4"]]);
      expect(RNFSMock.readDir).toHaveBeenCalledTimes(2);
      expect(RNFSMock.unlink).toHaveBeenCalledTimes(1);
      expect(RNFSMock.unlink).toHaveBeenCalledWith("/foo/bar/test2.mp4");
    })
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
      RNFSMock.readFile.mockImplementationOnce(()=>Promise.resolve("some invalid JSON"));
      await expect(getCachedHash("foo")).resolves.toBeUndefined();
      expect(warnMock).toHaveBeenCalledTimes(1);
    });
    it("will match data files even if cache.json has an error", async() =>{
      warnMock.mockImplementationOnce(()=>{});
      RNFSMock.readFile.mockImplementationOnce(()=>Promise.resolve("[]some invalid JSON"));
      await expect(getCachedHash("/some/path/data.json")).resolves.toBe(true);
      expect(warnMock).toHaveBeenCalledTimes(1);
      warnMock.mockRestore();
    });

    it("will match cached files", async() =>{
      RNFSMock.readFile.mockImplementationOnce(()=>Promise.resolve(JSON.stringify({items: {"/something/bar.mp4":"xxxxxxxx"}})));
      await expect(getCachedHash("/something/bar.mp4")).resolves.toBe("xxxxxxxx");
    });
    it("will return null if file is not cached", async() =>{
      RNFSMock.readFile.mockImplementationOnce(()=>Promise.resolve(JSON.stringify({items: {"/something/bar.mp4":"xxxxxxxx"}})));
      await expect(getCachedHash("/something/foofoo.mp4")).resolves.toBeUndefined();
    });
  });

  describe("CacheStage", function(){
    let nowMock, randomMock
    beforeAll(()=>{
      RNFSMock.writeFile = jest.fn(()=>Promise.resolve());
      nowMock = jest.spyOn(global.Date, "now");
      nowMock.mockImplementation(()=> 1591002281997 )
      randomMock = jest.spyOn(global.Math, "random");
      randomMock.mockImplementation(()=>0.6312298070619418);
    })
    afterAll(()=>{
      nowMock.mockRestore();
      randomMock.mockRestore();
    })
    it("initializes with a time-dependant ID", function(){
      const s = new CacheStage("foo");
      expect(s.id).toEqual("foo.kaw9ohl9.mq2nolyvzee");
    });
    it("can close if nothing was added", async ()=>{
      const s = new CacheStage("foo");
      await expect(s.close()).resolves.toBeUndefined();
      expect(RNFSMock.writeFile).toHaveBeenCalled();
    });
    
    it("can consolidate cache", async () => {
      RNFSMock.readFile.mockImplementationOnce(()=>Promise.resolve(JSON.stringify({
        "foo":{"baz.mp4":"vvvvvvvv"},
        "foo.kaw9ohl9.mq2nolyvzee": {"foo.mp4": "wwwwwwww","foofoo.mp4":"xxxxxxxx"},
        "bar.kaw9ohl9.mq2nolyvzee": {"bar.mp4": "yyyyyyyy","barbar.mp4":"zzzzzzzz"}
      }, null, 2)));
      await expect(CacheStage.closeAll()).resolves.toBeUndefined();
      expect(RNFSMock.writeFile).toHaveBeenCalledWith("/some/path/cache.json", 
        JSON.stringify({
          "foo":{"foo.mp4": "wwwwwwww","foofoo.mp4":"xxxxxxxx"},
          "bar": {"bar.mp4": "yyyyyyyy","barbar.mp4":"zzzzzzzz"},
        }, null, 2), 
        "utf8"
      );
    });
    it("CacheStage.closeAll() doesn't throw if cache can't be openned", async ()=>{
      RNFSMock.readFile.mockImplementationOnce(()=>Promise.reject({code: "ENOENT"}));
      expect(CacheStage.closeAll()).resolves.toBeUndefined();
    })

    describe("normal lifecycle", function(){
      let s;
      beforeEach(()=>{
        RNFSMock.readFile.mockImplementationOnce(()=> Promise.resolve(JSON.stringify({"foo": {"baz.mp4": "wwwwwwww"}})))
        RNFSMock.writeFile.mockImplementation((_, data)=>{
          RNFSMock.readFile.mockImplementation(()=>Promise.resolve(data));
          return Promise.resolve()
        });
        s = new CacheStage("foo");
      })
      afterEach(()=>{
        RNFSMock.readFile.mockReset();
        RNFSMock.writeFile.mockReset();
      })

      it("can add a file to stage", async ()=>{
        await expect(s.set("bar.mp4", "xxxxxxxx")).resolves.toBeUndefined();
        expect(RNFSMock.writeFile).toHaveBeenNthCalledWith(1,
          "/some/path/cache.json", 
          JSON.stringify({
            "foo":{"baz.mp4":"wwwwwwww"},
            "foo.kaw9ohl9.mq2nolyvzee": {"bar.mp4": "xxxxxxxx"}
          }, null, 2), 
          "utf8"
        );
      });

      it("can append files synchronously", async ()=>{
        await expect(s.set("bar.mp4", "xxxxxxxx")).resolves.toBeUndefined();
        await expect(s.set("barbar.mp4", "yyyyyyyy")).resolves.toBeUndefined();
        expect(RNFSMock.writeFile).toHaveBeenNthCalledWith(2,
          "/some/path/cache.json", 
          JSON.stringify({
            "foo":{"baz.mp4":"wwwwwwww"},
            "foo.kaw9ohl9.mq2nolyvzee": {"bar.mp4": "xxxxxxxx","barbar.mp4":"yyyyyyyy"}
          }, null, 2), 
          "utf8"
        );
      });
      it("can close staging area", async ()=>{
        await expect(s.set("bar.mp4", "xxxxxxxx")).resolves.toBeUndefined();
        await expect(s.set("barbar.mp4", "yyyyyyyy")).resolves.toBeUndefined();
        await expect(s.close()).resolves.toBeUndefined();
        expect(RNFSMock.writeFile).toHaveBeenNthCalledWith(3,
          "/some/path/cache.json", 
          JSON.stringify({
            "foo":{"bar.mp4": "xxxxxxxx","barbar.mp4":"yyyyyyyy"},
          }, null, 2), 
          "utf8"
        );
      });
    });

    describe("cancel lifecycle", function(){
      let s1, s2;
      beforeAll(()=>{
        RNFSMock.readFile.mockImplementationOnce(()=> Promise.resolve(JSON.stringify({"foo": {"baz.mp4": "wwwwwwww"}})))
        RNFSMock.writeFile.mockImplementation((_, data)=>{
          RNFSMock.readFile.mockImplementation(()=>Promise.resolve(data));
          return Promise.resolve()
        });
        s1 = new CacheStage("foo");
        nowMock.mockImplementationOnce(()=>1591004981354);
        s2 = new CacheStage("foo");
      })
      afterAll(()=>{
        RNFSMock.mockReset();
      })
      it("stages have different IDs", function(){
        expect(s1.id).not.toEqual(s2.id);
      })

      it("can add a file to first staging zone", async ()=>{
        await expect(s1.set("bar.mp4", "xxxxxxxx")).resolves.toBeUndefined();
        expect(RNFSMock.writeFile).toHaveBeenNthCalledWith(1,
          "/some/path/cache.json", 
          JSON.stringify({
            "foo":{"baz.mp4":"wwwwwwww"},
            "foo.kaw9ohl9.mq2nolyvzee": {"bar.mp4": "xxxxxxxx"}
          }, null, 2), 
          "utf8"
        );
      });

      it("can add a file to second staging zone", async ()=>{
        await expect(s2.set("barbar.mp4", "yyyyyyyy")).resolves.toBeUndefined();
        expect(RNFSMock.writeFile).toHaveBeenNthCalledWith(1,
          "/some/path/cache.json", 
          JSON.stringify({
            "foo":{"baz.mp4":"wwwwwwww"},
            "foo.kaw9ohl9.mq2nolyvzee": {"bar.mp4": "xxxxxxxx"},
            "foo.kawbacfe.mq2nolyvzee": {
              "barbar.mp4": "yyyyyyyy"
            }
          }, null, 2), 
          "utf8"
        );
      });

      it("can close staging area", async ()=>{
        await expect(s2.close()).resolves.toBeUndefined();
        expect(RNFSMock.writeFile).toHaveBeenNthCalledWith(1,
          "/some/path/cache.json", 
          JSON.stringify({
            "foo":{"bar.mp4": "xxxxxxxx","barbar.mp4":"yyyyyyyy"},
          }, null, 2), 
          "utf8"
        );
      });
    });

  })
})
