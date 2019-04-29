import Playlist from "../../src/components/Playlist"
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

network.getPlaylist = (url) => playlist;

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
          return Promise.resolve({
            ok: true,
            json: () => playlist
          });
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

test(".constructor basic", (done) => {
    let playlist = new Playlist("localhost");

    expect(playlist.playlist).toEqual([
        {active: true, imageUri: "http://localhost:3000/medias/foo.mp4?thumb=true", name: "foo.mp4", path: "/", rank: 0, title: "foo.mp4", url: "localhost"},
        {active: false, imageUri: "http://localhost:3000/medias/bar.mp4?thumb=true", name: "bar.mp4", path: "/", rank: 0, title: "bar.mp4", url: "localhost"},
        {active: true, imageUri: "http://localhost:3000/medias/baz.mp4?thumb=true", name: "baz.mp4", path: "/", rank: 0, title: "baz.mp4", url: "localhost"}
    ]);
    done();
})

test(".constructor customContents", (done) => {
    let playlist = new Playlist("localhost", ["blabla"]);

    expect(playlist.playlist).toEqual([{elem: "blabla", imageUri: "http://localhost:3000/medias/blabla?thumb=true", title: "blabla", url: "localhost"}]);
    done();
})

test(".constructor customContents + locaImage", (done) => {
    let playlist = new Playlist("localhost", ["blabla"], true);

    expect(playlist.playlist).toEqual([{elem: "blabla", imageUri: "file://./blabla.jpg", title: "blabla", url: "localhost"}]);
    done();
})

test(".constructor customContents + localImage", (done) => {
    let playlist = new Playlist("localhost", ["blabla"], true);

    expect(playlist.playlist).toEqual([{elem: "blabla", imageUri: "file://./blabla.jpg", title: "blabla", url: "localhost"}]);
    done();
})

test(".constructor customContents + localImage + customTitle", (done) => {
    let playlist = new Playlist("localhost", ["blabla"], true, ["foo"]);

    expect(playlist.playlist).toEqual([{elem: "blabla", imageUri: "file://./blabla.jpg", title: "foo", url: "localhost"}]);
    done();
})

test(".constructor 2xcustomContents + localImage + 1xcustomTitle", (done) => {
    let playlist = new Playlist("localhost", ["blabla", "blob"], true, ["foo"]);

    expect(playlist.playlist).toEqual([
        {elem: "blabla", imageUri: "file://./blabla.jpg", title: "foo", url: "localhost"},
        {elem: "blob", imageUri: "file://./blob.jpg", title: "blob", url: "localhost"}
    ]);
    done();
})