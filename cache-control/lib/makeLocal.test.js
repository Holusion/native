import { URL } from "url";

// get usefull mocks
jest.mock("./path", () => ({
  mediasPath: () => "/tmp/makeLocal-tests",
  filename: () => { },
}));

jest.mock("./cache", () => ({
  getCachedHash: () => Promise.resolve(),
}));

import { storage } from "firebase";

import { makeLocal } from ".";



describe("makeLocal", () => {
  let getMetadata;
  beforeAll(() => {
    getMetadata = jest.fn(() => Promise.resolve({ md5Hash: "xxxxxx" }));
    storage.mockImplementation(() => ({
      refFromURL: (url) => {
        const u = new URL(url);
        return {
          getMetadata,
          name: u.pathname.split("/").slice(-1)[0],
        }
      }
    }));
  });

  afterEach(() => {
    getMetadata.mockClear();
  })

  it("runs when there is nothing to do", async () => {
    await expect(makeLocal({ foo: "bar" })).resolves.toEqual([{ foo: "bar" }, new Map()]);
  })

  it("can be cancelled", async () => {
    const a = new AbortController();
    let p = makeLocal({ foo: "bar" }, {signal: a.signal});
    a.abort();
    await expect(p).resolves.toEqual([{ foo: "bar" }, new Map()]);
  })

  it("lists referenced files", async () => {
    await expect(makeLocal({
      foo: "gs://foo.appspot.com/bar.mp4",
    }, {})).resolves.toEqual([
      { foo: "file:///tmp/makeLocal-tests/bar.mp4" },
      new Map([
        [
          "/tmp/makeLocal-tests/bar.mp4",
          {
            "hash": "xxxxxx",
            "src": "gs://foo.appspot.com/bar.mp4",
          },
        ]
      ])
    ]);
  });

  it("proceed if it can't get a file's hash", async () => {
    const warnMock = jest.spyOn(global.console, "warn");
    warnMock.mockImplementationOnce(() => { });
    const e = new Error("storage/object-not-found");
    //Error codes found at : https://firebase.google.com/docs/storage/web/handle-errors
    e.code == "storage/object-not-found";
    getMetadata.mockImplementationOnce(() => Promise.reject(e));
    const [res, files] = await makeLocal({
      foo: "gs://foo.appspot.com/bar.mp4"
    });
    expect(getMetadata).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ foo: "file:///tmp/makeLocal-tests/bar.mp4" })
    expect(files).toEqual(new Map([
      [
        "/tmp/makeLocal-tests/bar.mp4",
        {
          "hash": true,
          "src": "gs://foo.appspot.com/bar.mp4",
        },
      ]
    ]));
    expect(warnMock).toHaveBeenCalled();
    warnMock.mockRestore();
  });

  it("cached files match metadata hash", async () => {
    getMetadata.mockImplementationOnce(() => Promise.resolve({ md5Hash: "xxxxx" }));
    const [res, files] = await makeLocal({
      foo: "gs://foo.appspot.com/bar.mp4"
    });
    expect(res).toEqual({ foo: "file:///tmp/makeLocal-tests/bar.mp4" });

    expect(files).toEqual(new Map([
      [
        "/tmp/makeLocal-tests/bar.mp4",
        {
          "hash": "xxxxx",
          "src": "gs://foo.appspot.com/bar.mp4",
        },
      ]
    ]));
  });

  it("recurses over nested objects", async () => {
    const [res, files] = await makeLocal({
      foo: "gs://foo.appspot.com/bar.mp4",
      foofoo: {
        bar: "gs://foo.appspot.com/barbar.mp4",
      }
    });

    expect(res).toEqual({
      foo: "file:///tmp/makeLocal-tests/bar.mp4",
      foofoo: { bar: "file:///tmp/makeLocal-tests/barbar.mp4" }
    });

    expect(files).toEqual(new Map([
      [
        "/tmp/makeLocal-tests/bar.mp4",
        {
          "hash": "xxxxxx",
          "src": "gs://foo.appspot.com/bar.mp4",
        },
      ], [
        "/tmp/makeLocal-tests/barbar.mp4",
        {
          "hash": "xxxxxx",
          "src": "gs://foo.appspot.com/barbar.mp4",
        },
      ]
    ]));
  });


  it("keep array structures", async () => {
    const [res, files] = await makeLocal({
      foo: "gs://foo.appspot.com/bar.mp4",
      foofoo:[ 
        {bar: "gs://foo.appspot.com/barbar.mp4"},
      ]
    });

    expect(res).toEqual({
      foo: "file:///tmp/makeLocal-tests/bar.mp4",
      foofoo: [{ bar: "file:///tmp/makeLocal-tests/barbar.mp4" }]
    });

    expect(files).toEqual(new Map([
      [
        "/tmp/makeLocal-tests/bar.mp4",
        {
          "hash": "xxxxxx",
          "src": "gs://foo.appspot.com/bar.mp4",
        },
      ], [
        "/tmp/makeLocal-tests/barbar.mp4",
        {
          "hash": "xxxxxx",
          "src": "gs://foo.appspot.com/barbar.mp4",
        },
      ]
    ]));
  });
})