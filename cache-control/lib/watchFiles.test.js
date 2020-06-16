
import {promises as fs} from "fs";
import {tmpdir} from "os"
import {join} from "path";

import {setBasePath, createStorage} from "./path";
import {onConfigSnapshot} from "./watchFiles";

import fsMock from "filesystem";

describe("watchFiles", function(){
  beforeAll(()=>{
    setBasePath("/path/to/tmp");
  })
  beforeEach(()=>{
    jest.clearAllMocks();
  })
  describe("onConfigSnapshot", function(){
    let logMock;
    
    beforeAll(()=>{
      logMock = jest.spyOn(global.console, "log");
      logMock.mockImplementation(()=>{});
    });
    
    afterAll(()=>{
      logMock.mockRestore();
    });
  
    it("no-op", async ()=>{
      const onProgress = jest.fn();
      const dispatch = jest.fn();
      await onConfigSnapshot(
        Promise.resolve([{foo:"bar"}, new Map()]), 
        {onProgress, dispatch}
      );
      expect(onProgress).not.toHaveBeenCalledWith(expect.stringMatching("Failed"));
      expect(dispatch).toHaveBeenCalledTimes(1);
    })
  });

  it("will download files", async ()=>{
    const onProgress = jest.fn();
    const dispatch = jest.fn();
    await onConfigSnapshot(
      Promise.resolve([{foo:"bar"}, new Map([["/path/to/bar.mp4", {src: "gs://foo.appspot.com", hash: "xxxxxx"}]])]), 
      {onProgress, dispatch}
    );
    expect(onProgress).not.toHaveBeenCalledWith(expect.stringMatching("Failed"));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
