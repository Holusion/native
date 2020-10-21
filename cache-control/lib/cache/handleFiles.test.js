jest.mock("../path");
import {getHash, sortFiles, handleFiles} from "./handleFiles";

import fsMock from "filesystem";

beforeEach(()=>{
  fsMock._reset();
})

describe("getHash()", ()=>{
  it("returns null if file doesn't exist", async ()=>{
    expect(await getHash("/foo.png")).toBe(null);
  })
  it("returns the file's hash if cached and exists", async ()=>{
    fsMock._set("/tmp/medias/foo.mp4", "--");
    fsMock._set("/tmp/storage/cache.json", JSON.stringify({"/tmp/medias/foo.mp4": "abcdef"}));
    expect(await getHash("/tmp/medias/foo.mp4")).toEqual("abcdef");
  })
  it("returns null if the file is cached but doesn't exists", async ()=>{
    fsMock._set("/tmp/storage/cache.json", JSON.stringify({"/tmp/medias/foo.mp4": "abcdef"}));
    expect(await getHash("/tmp/medias/foo.mp4")).toBe(null);
  })
  it("returns null if the file exists but it's hash is not saved", async ()=>{
    fsMock._set("/tmp/medias/foo.mp4", "--");
    expect(await getHash("/tmp/medias/foo.mp4")).toBe(null);
  })
})

describe("sortFiles()", ()=>{
  let files;
  beforeEach(()=>{
    files = new Map([
      ["/path/to/tmp/medias/bar.mp4", { src: 'gs://foo.appspot.com/bar.mp4', hash: "xxxxxx", size: 1024, contentType: "video/mp4"}],
      ["/path/to/tmp/medias/baz.png", { src: 'gs://foo.appspot.com/baz.png', hash: "xxxxxx", size: 1000, contentType: "image/png"}],
    ]);
  })
  it(`find cached files using getHash`, async ()=>{
    const fn = jest.fn(()=>Promise.resolve("xxxxxx"));
    expect(await sortFiles(files,{getHash: fn})).toMatchSnapshot();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith("/path/to/tmp/medias/bar.mp4");
    expect(fn).toHaveBeenCalledWith("/path/to/tmp/medias/baz.png");
  });

  it(`finds required uncached files`, async ()=>{
    files.get("/path/to/tmp/medias/baz.png").hash = "yyyyyy";
    const fn = jest.fn(()=>Promise.resolve("xxxxxx"));
    const res = await sortFiles(files,{getHash: fn})
    expect(res.required[0]).toHaveProperty("src");
    expect(res.required[0]).toHaveProperty("dest");
    expect(res.required[0]).toHaveProperty("size");
    expect(res).toMatchSnapshot();
  })
  it(`finds other uncached files`, async ()=>{
    files.get("/path/to/tmp/medias/bar.mp4").hash = "yyyyyy";
    const fn = jest.fn(()=>Promise.resolve("xxxxxx"));
    expect(await sortFiles(files,{getHash: fn})).toMatchSnapshot();
  })
})


describe("handleFiles()", ()=>{
  let files;
  beforeEach(()=>{
    files = new Map([
      ["/path/to/tmp/medias/bar.mp4", { src: 'gs://foo.appspot.com/bar.mp4', hash: "xxxxxx", size: 1024, contentType: "video/mp4"}],
      ["/path/to/tmp/medias/baz.png", { src: 'gs://foo.appspot.com/baz.png', hash: "xxxxxx", size: 1000, contentType: "image/png"}],
    ]);
  })

  it("uses a custom sortFiles function", async ()=>{
    const write = jest.fn();
    const fn = jest.fn(()=>Promise.resolve({required: [], cached:[],  other: [], }))
    let it = handleFiles(files, {sortFiles: fn, write});
    expect((await it.next()).done).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(write).not.toHaveBeenCalled();
  });

  it("finishes immediately if there is no files", async ()=>{
    const write = jest.fn();
    const fn = jest.fn(()=>Promise.resolve({required: [], cached:[],  other: [], }))
    let it = handleFiles(files, {sortFiles: fn, write});
    const res = await it.next();
    expect(res.value).not.toBeTruthy();
    expect(res.done).toBe(true);
  });
  it("finishes immediately if all files are cached", async ()=>{
    const write = jest.fn();
    const fn = jest.fn(()=>Promise.resolve({required: [], cached:[{src: "/foo.png", size: 20, dest:"/tmp/foo.png"}],  other: [] }))
    let it = handleFiles(files, {sortFiles: fn, write});
    const res = await it.next();
    expect(res.value).not.toBeTruthy();
    expect(res.done).toBe(true);
  });
  it("throws if sortFiles() fails", async ()=>{
    const write = jest.fn();
    let it = handleFiles(files, {sortFiles: ()=>Promise.reject(new Error("Booh")), write});
    await expect(it.next()).rejects.toThrow("Booh");
    expect(write).not.toHaveBeenCalled();
  })
  describe("with files to download", ()=>{
    let sortFiles, write;
    beforeEach(()=>{
      write = jest.fn();
      sortFiles = jest.fn(()=>Promise.resolve({
        required: [{src: "/bar.png", dest:"/tmp/bar.png", size: 10}],
        cached:[{src: "/foo.mp4", dest:"/tmp/foo.mp4", size: 20}],
        other: [{src: "/baz.jpg", dest:"/tmp/baz.jpg", size: 40}],
      }));
    })

    it("yields a first progress status after sortFiles()", async ()=>{
      let it = handleFiles(files, {sortFiles, write});
      expect((await it.next()).value).toMatchSnapshot();
      expect(sortFiles).toHaveBeenCalledTimes(1);
      expect(write).not.toHaveBeenCalled();
      //Iterator should not be finished yet
      expect((await it.next()).done).toBe(false);
    });
    it("calls writeToFile if some files need to be downloaded", async ()=>{
      const cb = jest.fn();
      for await (let p of handleFiles(files, {sortFiles, write})){
        cb(p);
      }
      expect(cb.mock.calls).toMatchSnapshot();
      expect(write).toHaveBeenCalledTimes(2);
      expect(write).toHaveBeenNthCalledWith(1, "/bar.png", "/tmp/bar.png")
      expect(write).toHaveBeenNthCalledWith(2, "/baz.jpg", "/tmp/baz.jpg")
    });
    it("throws if write fails", async ()=>{
      write.mockImplementationOnce(()=>Promise.reject(new Error("Booh")));
      await expect(async ()=>{
        for await (let p of handleFiles(files, {sortFiles, write})){  }
      }).rejects.toThrow("Booh");
    })
  })

  describe("with default write and save functions on mocked filesystem", ()=>{
    //If this fails but not other tests, it's probably a mock problem...
    let files;
    beforeEach(()=>{
      files = new Map([
        ["/path/to/tmp/medias/bar.mp4", { src: 'gs://foo.appspot.com/bar.mp4', hash: "xxxxxx", size: 1024, contentType: "video/mp4"}],
        ["/path/to/tmp/medias/baz.png", { src: 'gs://foo.appspot.com/baz.png', hash: "xxxxxx", size: 1000, contentType: "image/png"}],
      ]);
    })

    it("is indempotent", async ()=>{
      const cb = jest.fn();
      for await (let p of handleFiles(files)){};
      const ref = JSON.stringify(fsMock.contents);
      //Run again with the same set of files
      for await (let p of handleFiles(files)){
        cb(p);
      };
      expect(JSON.stringify(fsMock.contents)).toEqual(ref);
      expect(cb).not.toHaveBeenCalled();
    });
    it("can be called in parallel", async ()=>{
      const it = handleFiles(files);
      expect((await it.next()).value).toMatchSnapshot("01 analyze files");
      expect([(await it.next()).value, fsMock.contents]).toMatchSnapshot("02 write baz.png");
      // cancel this workflow and begin another
      const it2 = handleFiles(new Map([
        ...files, 
        ["/path/to/tmp/medias/foobar.png", { src: 'gs://foo.appspot.com/foobar.png', hash: "xxxxxx", size: 2000, contentType: "image/png"}],
      ]))
      expect((await it2.next()).value).toMatchSnapshot("03 analyze new files");
      expect([(await it2.next()).value, fsMock.contents]).toMatchSnapshot("04 write foobar.png");
      expect([(await it2.next()).value, fsMock.contents]).toMatchSnapshot("05 write bar.mp4");
      expect((await it2.next()).done).toBe(true);
    })
  })
})

/*
describe("handleFiles", ()=>{
  let wf, files;
  beforeEach(()=>{
    files = new Map([
      ["/path/to/tmp/medias/bar.mp4", { src: 'gs://foo.appspot.com/bar.mp4', hash: "xxxxxx", size: 1024, contentType: "video/mp4"}],
      ["/path/to/tmp/medias/baz.png", { src: 'gs://foo.appspot.com/bar.mp4', hash: "xxxxxx", size: 1000, contentType: "image/png"}],
    ]);
    wf = new WatchChanges({projectName: "foo"});
  });

  afterEach(()=>{
    wf.close();
  });

  it("process files to get a list of those missing", async ()=>{
    let cb = jest.fn();
    wf.on("progress", cb);
    await wf.handleFiles({files, name: "items"});
    expect(cb).toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith({
      length: 2,
      nbDone: 0,
      progress: 0,
      requiredSize: 1000,
      totalSize: 2024,
      blocking: true
    });
  });

  it("marks videos as non-required", async ()=>{
    let cb = jest.fn();
    wf.on("progress", cb);
    await wf.handleFiles({
      files: new Map([["/path/to/tmp/medias/bar.mp4", { src: 'gs://foo.appspot.com/bar.mp4', hash: "xxxxxx", size: 1024, contentType:"video/mp4"}]]), 
      name: "items"
    });
    expect(cb).toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith({
      length: 1,
      nbDone: 0,
      progress: 0,
      requiredSize: 0,
      totalSize: 1024,
      blocking: false,
    });
  });

  it("skips cached files", async ()=>{
    let cb = jest.fn();
    await saveCacheMock("items", {"/path/to/tmp/medias/bar.mp4": "xxxxxx"});
    let files = new Map([["/path/to/tmp/medias/bar.mp4", { src: 'gs://foo.appspot.com/bar.mp4', hash: "xxxxxx", size: 1024}]])
    wf.on("progress", cb);
    await wf.handleFiles({files, name: "items"});
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith({
      length: 1,
      nbDone: 1,
      progress: 0,
      requiredSize: 0,
      totalSize: 0,
      blocking: false
    });
  });

  it("handles write errors", (done)=>{
    let files = new Map([["/path/to/tmp/medias/bar.mp4", { src: 'gs://foo.appspot.com/bar.mp4', hash: "xxxxxx", size: 1024}]])
    writeToFileMock.mockImplementationOnce(()=>Promise.reject(new Error("Booh")));
    wf.on("error", (e)=>{
      expect(e.message).toMatch("Booh");
      done();
    });
    wf.handleFiles({files, name: "items"});
  })
  it("handles cache analysis errors", (done)=>{
    let files = new Map([["/path/to/tmp/medias/bar.mp4", { src: 'gs://foo.appspot.com/bar.mp4', hash: "xxxxxx", size: 1024}]])
    fsMock.exists.mockImplementationOnce(()=>Promise.reject(new Error("Booh")));
    wf.on("error", (e)=>{
      expect(e.message).toMatch("Booh");
      done();
    });
    wf.handleFiles({files, name: "items"});
  })

  it("can be cancelled and called again", async ()=>{
    const cb = jest.fn();
    wf.on("progress", cb);
    wf.handleFiles({files, name: "items"});
    await wf.handleFiles({files, name: "items"});
    expect(cb).toHaveBeenCalledTimes(3);
  });

  it("keep downloaded files for subsequent calls", (done)=>{
    let count = 0;
    wf.on("progress", (p)=>{
      switch(++count){
        case 1:
          expect(p.progress).toEqual(0);
          break;
        case 2:
          expect(p.nbDone).toEqual(1);
          expect(p.blocking).toBe(false);
          wf.handleFiles({files: new Map(), name: "items"});
          break;
        case 3:
          expect(p).toEqual({
            length: 0,
            nbDone: 0,
            progress: 0,
            requiredSize: 0,
            totalSize: 0,
            blocking: false
          });
        default:
          done();
      }
    });
    wf.handleFiles({files, name: "items"});
  })

})
//*/