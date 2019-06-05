import { playlistFromContents, playlistFromNetwork } from "../../src/components/Playlist"
import * as network from "../../src/utils/Network"

let playlist = [
    {name: "foo.mp4", rank: 0, path: '/', active: true},
    {name: "bar.mp4", rank: 0, path: '/', active: false},
    {name: "baz.mp4", rank: 0, path: '/', active: true}
];

jest.mock("react-native-fs", () => {
    return {
        DocumentDirectoryPath: "."
    }
});
  
describe(".playlistFromContents", () => {
  it("basic case", () => {
    const contents = [{name: 'a', title: 'b'}, {name: 'b', title: 'a'}]
    const res = playlistFromContents("localhost", contents);
    const expected = [{url: "localhost", name: 'a', title: 'b', imageUri: 'file://./a.jpg'}, {url: "localhost", name: 'b', title: 'a', imageUri: 'file://./b.jpg'}]
    expect(res).toEqual(expected)
  })

  it("when contents empty", () => {
    const contents = [];
    const res = playlistFromContents("localhost", contents);
    const expected = [];
    expect(res).toEqual(expected);
  })
})

describe(".playlistFromNetwork", () => {
  beforeAll(() => {
    const mockLocalhostResponse = Promise.resolve(playlist);
    const mockEmptyResponse = Promise.resolve([]);
    const mockErrorResponse = Promise.reject(new Error("Network Error"));

    const mockFetchPromiseLocalhost = Promise.resolve({
      json: () => mockLocalhostResponse
    })
    const mockFetchPromiseEmpty = Promise.resolve({
      json: () => mockEmptyResponse
    })
    const mockFetchPromiseError = Promise.resolve({
      json: () => mockErrorResponse
    })

    global.fetch = jest.fn((url) => {
      if(url.includes('localhost')) return mockFetchPromiseLocalhost;
      else if(url.includes('empty')) return mockFetchPromiseEmpty;
      else return mockFetchPromiseError;
    })
  })

  afterAll(() => {
    global.fetch.mockClear()
  })

  it("basic case", async () => {
    const contents = await playlistFromNetwork("localhost");
    expect(contents).toEqual([
      {active: true, imageUri: "http://localhost:3000/medias/foo.mp4?thumb=true", name: "foo.mp4", path: "/", rank: 0, title: "foo.mp4", url: "localhost"},
      {active: false, imageUri: "http://localhost:3000/medias/bar.mp4?thumb=true", name: "bar.mp4", path: "/", rank: 0, title: "bar.mp4", url: "localhost"},
      {active: true, imageUri: "http://localhost:3000/medias/baz.mp4?thumb=true", name: "baz.mp4", path: "/", rank: 0, title: "baz.mp4", url: "localhost"}
    ]);
  })

  it("when empty playlist", async () => {
    const contents = await playlistFromNetwork("empty");
    expect(contents).toEqual([]);
  })

  it("when empty playlist", async () => {
    try {
      await playlistFromNetwork("error");
      fail(new Error("This test should throw a Network Error"));
    } catch(err) {
      expect(err.message).toEqual("Network Error");
    }
  })
})