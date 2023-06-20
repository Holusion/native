
import {basename, join} from "./filepaths.native";


describe("filepath.native", ()=>{
  describe("join()", ()=>{
    it("joins path parts", ()=>{
      expect(join("/path/to/dir", "foo.txt")).toEqual("/path/to/dir/foo.txt");
    });
    it("reduces unnecessary separators", function(){
      expect(join("/path/to/dir/", "foo.txt")).toEqual("/path/to/dir/foo.txt");
    });
  });
  describe("basename()", ()=>{
    it("extract name from file path", ()=>{
      expect(basename("/path/to/foo.txt")).toEqual("foo.txt");
    })
  })
})