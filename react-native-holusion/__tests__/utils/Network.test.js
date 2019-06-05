import * as network from '../../src/utils/Network'

let playlist = [
  {name: "foo.mp4", rank: 0, path: '/', active: true},
  {name: "bar.mp4", rank: 0, path: '/', active: false},
  {name: "baz.mp4", rank: 0, path: '/', active: true}
];

let currentPlay = "foo.mp4";

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


describe("Network", () => {
  beforeEach(() => {
    init();
  })

  beforeAll(() => {
    const mockLocalhostResponse = Promise.resolve(playlist);
    const mockEmptyResponse = Promise.resolve([]);
    const mockErrorResponse = Promise.reject(new Error("Network Error"));
    const mockPutActiveError = Promise.reject(new Error("putactive throw"))

    const mockFetchPromiseLocalhost = Promise.resolve({
      json: () => mockLocalhostResponse
    })
    const mockFetchPromiseEmpty = Promise.resolve({
      json: () => mockEmptyResponse
    })
    const mockFetchPromiseError = Promise.resolve({
      json: () => mockErrorResponse
    })

    global.fetch = jest.fn((url, obj) => {
      if(!obj) {
        obj = {method: 'GET'};
        if(url.includes('localhost') || url.includes("putactive")) return mockFetchPromiseLocalhost;
        else if(url.includes('empty')) return mockFetchPromiseEmpty;
        else return mockFetchPromiseError;
      }

      if(url.endsWith('/playlist')) {
        switch (obj.method) {
          case 'PUT':
            if(url.includes("putactive")) return mockPutActiveError;
            let body = JSON.parse(obj.body);
            playlist = playlist.map(elem => elem.name === body.name ? body : elem);
            break;
          default:
            return mockFetchPromiseLocalhost
        }
      } else if(url.includes('current')) {
        switch (obj.method) {
          case 'PUT':
            let urlSplit = url.split('/');
            let name = urlSplit[urlSplit.length - 1];
            if(playlist.filter(elem => elem.name == name).length == 0) {
              return Promise.reject(new Error("media not exists"));
            } else {
              currentPlay = name;
            }
            break;
          default:
            
        }
      }
    })
  })

  afterAll(() => {
    global.fetch.mockClear();
  })

  describe("activeWithPredicate", () => {
    it('basic case', async () => {
      let errors = await network.activeWithPredicate("localhost", elem => elem.active, false);
      expect(playlist).toEqual([
        {name: "foo.mp4", rank: 0, path: '/', active: false},
        {name: "bar.mp4", rank: 0, path: '/', active: false},
        {name: "baz.mp4", rank: 0, path: '/', active: false}
      ]);
      expect(errors.length).toEqual(0);
    })

    it('when fetch "error" playlist', async () => {
      try {
        await network.activeWithPredicate("error", elem => elem.active, false);
        fail(new Error(`Should throw error`))
      } catch(err) {
        expect(err.message).toEqual("Network Error")
      }
    })

    it('when playlistPutActive should throw', async () => {
      let errors = await network.activeWithPredicate("putactive", elem => elem.active, false);
      expect(errors.length).toBeGreaterThan(0);
    })
  })

  describe(".getPlaylist", () => {
    it('basic case', async () => {
      let res = await network.getPlaylist("localhost");
      expect(res).toEqual(playlist)
    })
  })

  describe(".desactiveAll", () => {
    it('basic case', async () => {
      await network.desactiveAll("localhost");
      expect(playlist).toEqual([
        {name: "foo.mp4", rank: 0, path: '/', active: false},
        {name: "bar.mp4", rank: 0, path: '/', active: false},
        {name: "baz.mp4", rank: 0, path: '/', active: false}
      ]);
    })

    it('when playlistPutActive should throw', async () => {
      let errors = await network.desactiveAll("putactive");
      expect(errors.length).toBeGreaterThan(0);
    })
  })

  describe(".activeAll", () => {
    it('basic case', async () => {
      await network.activeAll("localhost");
      expect(playlist).toEqual([
        {name: "foo.mp4", rank: 0, path: '/', active: true},
        {name: "bar.mp4", rank: 0, path: '/', active: true},
        {name: "baz.mp4", rank: 0, path: '/', active: true}
      ]);
    })

    it('when playlistPutActive should throw', async () => {
      let errors = await network.activeAll("putactive");
      expect(errors.length).toBeGreaterThan(0);
    })
  })

  describe(".active", () => {
    it('basic case', async () => {
      await network.active("localhost", 'bar.mp4');
      expect(playlist).toEqual([
        {name: "foo.mp4", rank: 0, path: '/', active: true},
        {name: "bar.mp4", rank: 0, path: '/', active: true},
        {name: "baz.mp4", rank: 0, path: '/', active: true}
      ]);
    })

    it('when playlistPutActive should throw', async () => {
      let errors = await network.active("putactive", "bar.mp4");
      expect(errors.length).toBeGreaterThan(0);
    })
  })

  describe(".activeOnlyYamlItems", () => {
    it('basic case', async () => {
      await network.activeOnlyYamlItems("localhost", {bar: {}});
      expect(playlist).toEqual([
        {name: "foo.mp4", rank: 0, path: '/', active: true},
        {name: "bar.mp4", rank: 0, path: '/', active: true},
        {name: "baz.mp4", rank: 0, path: '/', active: true}
      ]);
    })

    it('when playlistPutActive should throw', async () => {
      let errors = await network.activeOnlyYamlItems("putactive", {bar:{}});
      expect(errors.length).toBeGreaterThan(0);
    })
  })

  describe(".play", () => {
    it('basic case', async () => {
      await network.play("localhost", 'baz.mp4');
      expect(currentPlay).toEqual('baz.mp4');
    })

    it('should throw when object not exists', async () => {
      try {
        await network.play("localhost", "not_exist.mp4")
        fail(new Error("this should throw an error"))
      } catch(err) {
        expect(err.message).toEqual("media not exists");
      }
    })
  })

  describe(".getUrls", () => {

    it('when no url found', () => {
      expect(network.getUrl(0)).toBe(null);
    })
    
    it('when resolved', () => {
      let callbackCalled = false;
      network.connect(() => callbackCalled = true);
      expect(network.getUrl(0)).toEqual("192.168.0.1");
      expect(callbackCalled).toEqual(true);
    })
  })
})
