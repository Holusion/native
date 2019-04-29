import * as network from '../../src/utils/Network'

let playlist = [
  {name: "foo.mp4", rank: 0, path: '/', active: true},
  {name: "bar.mp4", rank: 0, path: '/', active: false},
  {name: "baz.mp4", rank: 0, path: '/', active: true}
];

let currentPlay = "foo.mp4";

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

jest.mock("react-native-zeroconf", () => {
  return class Zeroconf {
    status = "";

    scan = (service, protocol, locale) => {
      this.status = 'resolved';
    }
    on = (event, callback) => {
      if(this.status == 'resolved' && event == "resolved") {
        callback({name: 'foo', addresses: ["192.168.0.1"]})
      }
      if(event == 'remove' && this.status == 'remove') {
        callback("foo")
      }
    }
  }
})

const init = () => {
  playlist = [
    {name: "foo.mp4", rank: 0, path: '/', active: true},
    {name: "bar.mp4", rank: 0, path: '/', active: false},
    {name: "baz.mp4", rank: 0, path: '/', active: true}
  ];
}

beforeEach(() => {
  init();
})

test('.getPlaylist', async () => {
  let res = await network.getPlaylist("localhost");
  expect(res).toEqual(playlist)
})

test('.desactiveAll', async () => {
  await network.desactiveAll("localhost");
  expect(playlist).toEqual([
    {name: "foo.mp4", rank: 0, path: '/', active: false},
    {name: "bar.mp4", rank: 0, path: '/', active: false},
    {name: "baz.mp4", rank: 0, path: '/', active: false}
  ]);
})

test('.activeAll', async () => {
  await network.activeAll("localhost");
  expect(playlist).toEqual([
    {name: "foo.mp4", rank: 0, path: '/', active: true},
    {name: "bar.mp4", rank: 0, path: '/', active: true},
    {name: "baz.mp4", rank: 0, path: '/', active: true}
  ]);
})

test('.active', async () => {
  await network.active("localhost", 'bar.mp4');
  expect(playlist).toEqual([
    {name: "foo.mp4", rank: 0, path: '/', active: true},
    {name: "bar.mp4", rank: 0, path: '/', active: true},
    {name: "baz.mp4", rank: 0, path: '/', active: true}
  ]);
})

test('.play', async () => {
  await network.play("localhost", 'baz.mp4');
  expect(currentPlay).toEqual('baz.mp4');
})

test('.getUrls when no url found', () => {
  expect(network.getUrl(0)).toBe(null);
})

test('.getUrls when resolved', () => {
  let callbackCalled = false;
  network.connect(() => callbackCalled = true);
  expect(network.getUrl(0)).toEqual("192.168.0.1");
  expect(callbackCalled).toEqual(true);
})