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

// network.getPlaylist = (url) => playlist;

fetch = (url, obj) => {
    if(!obj) {
      obj = {method: 'GET'};
    }
  
    if(url.endsWith('/playlist')) {
      switch (obj.method) {
        case 'PUT':
          let body = JSON.parse(obj.body);
          playlist = playlist.map(elem => elem.name === body.name ? body : elem);
          break;
        default:
          if(url.includes('localhost')) {
            return Promise.resolve({
              ok: true,
              json: () => playlist
            });
          } else if(url.includes('empty')) {
            return Promise.resolve({
              ok: true,
              json: () => []
            });
          } else {
            return Promise.reject(new Error("Network Error"));
          }
      }
    } else if(url.includes('current')) {
      switch (obj.method) {
        case 'PUT':
          let urlSplit = url.split('/');
          currentPlay = urlSplit[urlSplit.length - 1];
          break;
        default:
  
      }
    }
  }

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