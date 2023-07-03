'use strict';

import {reducers} from "..";
import {
  setDependencies, getDependencies, 
  setFiles, getUncachedFiles, getRequiredFiles, getOtherFiles, SET_DEPENDENCIES
} from ".";

import {makeFileRef} from "./_mock_fileRef";
import { getRequiredSize, getOtherSize, SET_CACHED_FILE, isCached, getCachedFiles, getHash, setHash, unsetHash } from './actions';
import { getError } from '../logs';


describe("files reducer", function () {
  let initialState;
  beforeEach(()=>{
    initialState = reducers(reducers(undefined, {}), setFiles({
      list: {
        "/tmp/foo.png": makeFileRef("foo.png", {size: 32}),
        "/tmp/foofoo.png": makeFileRef("foofoo.png", {size: 64}),
        "/tmp/bar.mp4": makeFileRef("bar.mp4", {size: 128}),
        "/tmp/barbar.mp4": makeFileRef("barbar.mp4", {size: 256}),
      },
      itemFiles:["/tmp/foo.png", "/tmp/foofoo.png"],
      configFiles: ["/tmp/bar.mp4", "/tmp/barbar.mp4"],
      cache: {"/tmp/foofoo.png": "xxxxxx", "/tmp/barbar.mp4":"xxxxxx"},
    }));
  })
  describe("setFiles()", ()=>{
    test("initial state shape", ()=>{
      expect(getDependencies(initialState)).toHaveLength(4);
      expect(initialState).toMatchSnapshot();
    })
    test("ignore errors", ()=>{
      expect(reducers(initialState, setFiles({error: new Error("Booh")}))).toHaveProperty("files", initialState.files);
    })
  });

  describe("setDependencies()", ()=>{
    test("change files dependencies for items", ()=>{
      let s = reducers(initialState, setDependencies("items", {
        "/tmp/baz.png": makeFileRef("baz.png"),
      }));
      expect(getDependencies(s)).toHaveLength(3);
      expect(s.files).toMatchSnapshot();
    });
    test("change files dependencies for config", ()=>{
      let s = reducers(initialState, setDependencies("config", {
        "/tmp/baz.png": makeFileRef("baz.png"),
      }));
      expect(getDependencies(s)).toHaveLength(3);
      expect(s.files).toMatchSnapshot();
    });

    test("merge dependencies for items and config", ()=>{
      let s = reducers(undefined, setDependencies("items", {
        "/tmp/baz.png": makeFileRef("baz.png"),
      }));
      s = reducers(s, setDependencies("config", {
        "/tmp/baz.png": makeFileRef("baz.png"),
      }));
      expect(getDependencies(s)).toHaveLength(1);
      expect(s.files).toMatchSnapshot();
    })

    test("remove unused dependencies", ()=>{
      let s = reducers(initialState, setDependencies("items", {}));
      expect(getDependencies(s)).toHaveLength(2);
      expect(s.files).toMatchSnapshot();
    })

    test("update file hash", ()=>{
      let s = reducers(initialState, setDependencies("items", {
        "/tmp/foo.png": makeFileRef("foo.png", {hash:"aaaaaa"}),
        "/tmp/foofoo.npg": makeFileRef("foofoo.png"),
      }));
      expect(getDependencies(s)).toHaveLength(4);
      expect(s.files).toMatchSnapshot();
    })

    test("handle dependencies errors", ()=>{
      let err = new Error("Booh");
      let s = reducers(initialState, {type: SET_DEPENDENCIES, error: err});
      expect(s.files).toBe(initialState.files);
      expect(getError(s, SET_DEPENDENCIES)).toEqual(expect.objectContaining({
        name: SET_DEPENDENCIES,
        message: err.message,
        severity: "error"
      }));
    })

    test("handle setHash errors", ()=>{
      let err = new Error("Booh");
      let s = reducers(initialState, {type: SET_CACHED_FILE, error: err});
      expect(s.files).toBe(initialState.files);
      expect(getError(s, SET_CACHED_FILE)).toEqual(expect.objectContaining({
        name: SET_CACHED_FILE,
        message: err.message,
        severity: "error"
      }));
    })
  })

  describe("setHash() / getHash()", ()=>{
    test("uses cached files list", ()=>{
      expect(getHash(initialState, "/tmp/foofoo.png")).toEqual("xxxxxx");
    })
    test("returns undefined for uncached files", ()=>{
      expect(getHash(initialState, "/tmp/foo.png")).toBeUndefined();
    })
    test("also match file:// prefix", ()=>{
      expect(getHash(initialState, "file:///tmp/foofoo.png")).toEqual("xxxxxx");
    })

    test("set a file's hash", ()=>{
      let s = reducers(initialState, setHash("/tmp/foo/bar.mp4", "spYioUcdUZuOcP2/N8eCkQ=="));
      expect(getHash(s, "/tmp/foo/bar.mp4")).toEqual("spYioUcdUZuOcP2/N8eCkQ==");
    });
  })

  describe("unsetHash()", ()=>{
    test("removes a file from cache", ()=>{
      expect(getHash(initialState, "/tmp/foofoo.png")).toEqual("xxxxxx");
      let s = reducers(initialState, unsetHash("/tmp/foofoo.png"));
      expect(s.files.cache).not.toEqual(initialState.files.cache);
      expect(getHash(s, "/tmp/foofoo.png")).toBeUndefined();
    });

    test("don't throw if file is absent", ()=>{
      let cache = initialState.files.cache;
      let s = reducers(initialState, unsetHash("/tmp/absent-file.png"));
      expect(s.files.cache).toEqual(cache);
    });
  })


  describe("getUncachedFiles()", ()=>{
    test("list files not in cache", ()=>{
      expect(getUncachedFiles(initialState)).toHaveLength(2);
    });
    test("match files that have incorrect cached hash", ()=>{
      let s = reducers(undefined, setFiles({
        list: {"/tmp/foo.png": makeFileRef("foo.png")},
        itemFiles: ["/tmp/foo.png"],
        cache: {"/tmp/foo.png":"aaaaaa"}
      }));
      expect(getUncachedFiles(s)).toHaveLength(1);
    })
    test("don't match cached files", ()=>{
      let s = reducers(initialState, setFiles({
        list: {"/tmp/foo.png": makeFileRef("foo.png")},
        itemFiles: ["/tmp/foo.png"],
        cache: {"/tmp/foo.png":"xxxxxx"}
      }));
      expect(getUncachedFiles(s)).toHaveLength(0);
    })
  })

  describe("getCachedFiles()", ()=>{
    test("list files in cache", ()=>{
      expect(getCachedFiles(initialState)).toMatchSnapshot();
    })
  })
  describe("getRequiredFiles()", ()=>{
    test("don't match video files or cached files", ()=>{
      let files = getRequiredFiles(initialState);
      expect(files).toEqual(["/tmp/foo.png"]);
    })
  })

  describe("getOtherFiles()", ()=>{
    test("don't match video files", ()=>{
      let files = getOtherFiles(initialState);
      expect(files).toHaveLength(1);
      expect(files).toEqual(expect.arrayContaining(["/tmp/bar.mp4"]));
    })
  })


  describe("getRequiredSize()", ()=>{
    test("don't match video files", ()=>{
      let size = getRequiredSize(initialState);
      expect(size).toEqual(32);
    });
  })

  describe("getOtherSize()", ()=>{
    test("don't match video files", ()=>{
      let size = getOtherSize(initialState);
      expect(size).toEqual(128);
    });
  })

  describe("isCached()", ()=>{
    test("always returns false if hash is not provided", ()=>{
      expect(isCached({files: {cache:{"/tmp/foo.png":"xxxxxx"}}}, "/tmp/foo.png", null)).toBe(false);
    })
    test("returns true if hash matches cache", ()=>{
      expect(isCached({files: {cache:{"/tmp/foo.png":"xxxxxx"}}}, "/tmp/foo.png", "xxxxxx")).toBe(true);
    })
  })
})
