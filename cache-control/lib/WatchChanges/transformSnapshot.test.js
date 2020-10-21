
import { setBasePath } from "../path";
import { transformSnapshot } from ".";



describe("transformSnapshot", function(){
  it("works on an empty array", async()=>{
    await expect(transformSnapshot([], {
      exists: true,
      data:()=>({foo: "bar"}), 
      id: "alice"
    })).resolves.toEqual([
      {foo: "bar", id: "alice"},
      new Map(),
    ]);
  });

  it("merges files requirements", async()=>{
    await expect(transformSnapshot([
      ()=> ([{"foofoo": "barbar"}, new Map([["/path/to/bar.mp4", {hash: "xxxxxx", src:"gs://foo.appspot.com/bar.mp4"}]])]),
      ()=> ([{"foofoo": "barbar"}, new Map([["/path/to/baz.mp4", {hash: "yyyyyy", src:"gs://foo.appspot.com/baz.mp4"}]])]),
    ], {
      exists: true,
      data:()=>({foo: "bar"}), 
      id: "alice"
    })).resolves.toEqual([
      {foofoo: "barbar"},
      new Map([
        ["/path/to/bar.mp4", {hash: "xxxxxx", src:"gs://foo.appspot.com/bar.mp4"}],
        ["/path/to/baz.mp4", {hash: "yyyyyy", src:"gs://foo.appspot.com/baz.mp4"}]
      ]),
    ]);
  });
});