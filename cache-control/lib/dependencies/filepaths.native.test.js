import {join as nodeJoin} from "path";
import {basename, join, sep} from "./filepaths.native";


describe("filepath.native", ()=>{
  describe("join()", ()=>{
    it("joins path parts", ()=>{
      expect(join("/path/to/dir", "foo.txt")).toEqual("/path/to/dir/foo.txt");
    });
    [
      ["/path/to/dir/foo.txt"],
      ["/path/to/dir", "foo.txt"],
      ["/path/to/dir/", "foo.txt"],
      ["/path/to/dir/", "/foo.txt"],
      [],
      ["",""],
    ].forEach((paths)=>{
      it(`mathes node's path.join(${paths.join(", ")})`, ()=>{
        expect(join(...paths)).toEqual(nodeJoin(...paths));
      });
    });
  });

  describe("basename()", ()=>{
    it("extract name from file path", ()=>{
      expect(basename("/path/to/foo.txt")).toEqual("foo.txt");
    })
  });
  describe("sep", ()=>{
    it("path separator is always / for native systems", ()=>{
      expect(sep).toEqual("/");
    });
  });
})
