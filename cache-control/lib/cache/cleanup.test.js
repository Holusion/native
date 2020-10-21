import fsMock from "filesystem";
jest.mock("../path");
jest.mock('../readWrite');
import {loadFile} from "../readWrite";

import {cleanup} from "."



describe("cleanup()", function(){
  beforeEach(()=>{
    fsMock._reset();
    fsMock.readdir.mockClear();
    fsMock.unlink.mockImplementation(()=>Promise.resolve());
  })

  it("deletes stale files", async function(){
    loadFile.mockResolvedValue(JSON.stringify({"/tmp/storage/cache.json": true}))
    fsMock.readdir.mockResolvedValueOnce([
      { path: "/tmp/storage/cache.json", isDirectory: ()=> false },
      { path: "/tmp/storage/bar.mp4", isDirectory: ()=> false }
    ])
    await expect(cleanup(["/tmp/storage/cache.json"], "/tmp/storage")).resolves.toEqual([["/tmp/storage/bar.mp4"], ["/tmp/storage/cache.json"]]);
    expect(fsMock.unlink).toHaveBeenCalledTimes(1);
    expect(fsMock.unlink).toHaveBeenCalledWith("/tmp/storage/bar.mp4");
  })
    
  it("handles readdir error", async function(){
    let e = new Error("No such file or directory");
    e.code = "ENOENT";
    fsMock.readdir.mockRejectedValueOnce(e);
    await expect(cleanup(["/foo/cache.json"], "/foo")).rejects.toThrow(e);
  })

  it("deletes stale files (with nodejs's Dirent objects)", async function(){
    // Dirent objects have no "path" property
    // https://nodejs.org/api/fs.html#fs_class_fs_dirent
    fsMock.readdir.mockResolvedValueOnce([
      { name: "cache.json", isDirectory: ()=> false },
      { name: "bar.mp4", isDirectory: ()=> false }
    ])
    fsMock.unlink.mockReset();
    await expect(cleanup(["/foo/cache.json"], "/foo")).resolves.toEqual([["/foo/bar.mp4"], ["/foo/cache.json"]]);
    expect(fsMock.unlink).toHaveBeenCalledTimes(1);
    expect(fsMock.unlink).toHaveBeenCalledWith("/foo/bar.mp4");
  })

  it("delete whole directories", async function(){
    fsMock.readdir.mockResolvedValueOnce([
      { path: "/foo/cache.json", isDirectory: ()=> false },
      { path: "/foo/bar", isDirectory: ()=> true},
    ])
    await expect(cleanup(["/foo/cache.json"])).resolves.toEqual([["/foo/bar"], ["/foo/cache.json"]]);
    expect(fsMock.readdir).toHaveBeenCalledTimes(1);
    expect(fsMock.rmdir).toHaveBeenCalledTimes(1);
    expect(fsMock.rmdir).toHaveBeenCalledWith("/foo/bar");
  })

  it("recurse in directories", async function(){
    fsMock.readdir.mockResolvedValueOnce([
      { path: "/foo/bar", isDirectory: ()=> true},
    ])
    .mockResolvedValueOnce([
      { path: "/foo/bar/test1.mp4", isDirectory: ()=> false},
      { path: "/foo/bar/test2.mp4", isDirectory: ()=> false},
    ])
    await expect(cleanup(["/foo/bar/test1.mp4"])).resolves.toEqual([["/foo/bar/test2.mp4"], ["/foo/bar/test1.mp4"]]);
    expect(fsMock.readdir).toHaveBeenCalledTimes(2);
    expect(fsMock.unlink).toHaveBeenCalledTimes(1);
    expect(fsMock.unlink).toHaveBeenCalledWith("/foo/bar/test2.mp4");
  })
})