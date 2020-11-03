
// get usefull mocks
jest.mock("../path", () => ({
  mediasPath: () => "/tmp/makeLocal-tests",
  filename: () => { },
}));


import { makeLocalFactory } from ".";


describe("makeLocal()", ()=>{
  let getMetadata, makeLocal;
  beforeAll(() => {
    makeLocal = makeLocalFactory("foo");
  });
  
  it("runs when there is nothing to do", () => {
    expect(makeLocal({ foo: "bar" })).toEqual([{ foo: "bar" }, new Set()]);
  })
  
  it("can be cancelled", () => {
    const a = new AbortController();
    let p = makeLocal({ foo: "bar" }, {signal: a.signal});
    a.abort();
    expect(p).toEqual([{ foo: "bar" }, new Set()]);
  })
  
  it("lists referenced files", () => {
    expect(makeLocal({
      foo: "gs://example.com/bar.mp4",
    }, {})).toEqual([
      { foo: "file:///tmp/makeLocal-tests/bar.mp4" },
      new Set([
        "gs://example.com/bar.mp4",
      ])
    ]);
  });
  
  it("handles relative links", ()=>{
    expect(makeLocal({
      foo: "//bar.mp4",
    }, {})).toEqual([
      { foo: "file:///tmp/makeLocal-tests/bar.mp4" },
      new Set([
        "gs://example.com/applications/foo/bar.mp4",
      ])
    ]);
  })

  it("cached files match metadata hash", () => {
    const [res, files] = makeLocal({
      foo: "gs://example.com/bar.mp4"
    });
    expect(res).toEqual({ foo: "file:///tmp/makeLocal-tests/bar.mp4" });
  
    expect(files).toEqual(new Set([
      "gs://example.com/bar.mp4",
    ]));
  });
  
  it("recurses over nested objects", () => {
    const [res, files] = makeLocal({
      foo: "gs://example.com/bar.mp4",
      foofoo: {
        bar: "gs://example.com/barbar.mp4",
      }
    });
  
    expect(res).toEqual({
      foo: "file:///tmp/makeLocal-tests/bar.mp4",
      foofoo: { bar: "file:///tmp/makeLocal-tests/barbar.mp4" }
    });
  
    expect(files).toEqual(new Set([
      "gs://example.com/bar.mp4",
      "gs://example.com/barbar.mp4",
    ]));
  });
  
  
  it("keep array structures", () => {
    const [res, files] = makeLocal({
      foo: "gs://example.com/bar.mp4",
      foofoo:[ 
        {bar: "gs://example.com/barbar.mp4"},
      ]
    });
  
    expect(res).toEqual({
      foo: "file:///tmp/makeLocal-tests/bar.mp4",
      foofoo: [{ bar: "file:///tmp/makeLocal-tests/barbar.mp4" }]
    });
  
    expect(files).toEqual(new Set([
      "gs://example.com/bar.mp4",
      "gs://example.com/barbar.mp4",
    ]));
  });
  
})
