
import { transformSnapshot } from ".";


// get usefull mocks
jest.mock("../path", () => ({
  mediasPath: () => "/tmp/transformSnapshot-tests",
  filename: () => { },
}));

describe("transformSnapshot", function(){
  if("if snapshot does not exists", async()=>{
    await expect(transformSnapshot([], {exists: false}))
    .resolves.toEqual([{}, new Map()]);
  })
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
      ()=> ([{"foofoo": "barbar"}, new Set(["gs://example.com/bar.mp4"])]),
      ()=> ([{"foofoo": "barbar"}, new Set(["gs://example.com/baz.mp4"])]),
    ], {
      exists: true,
      data:()=>({foo: "bar"}), 
      id: "alice"
    })).resolves.toEqual([
      {foofoo: "barbar"},
      new Map([
        ["/tmp/transformSnapshot-tests/bar.mp4", {
          dest: "/tmp/transformSnapshot-tests/bar.mp4",
          contentType: "video/mp4",
          size: 24,
          hash: "xxxxxx", 
          src:"gs://example.com/bar.mp4"
        }],
        ["/tmp/transformSnapshot-tests/baz.mp4", {
          dest: "/tmp/transformSnapshot-tests/baz.mp4",
          contentType: "video/mp4",
          size: 24,
          hash: "xxxxxx", 
          src:"gs://example.com/baz.mp4"
        }]
      ]),
    ]);
  });
});