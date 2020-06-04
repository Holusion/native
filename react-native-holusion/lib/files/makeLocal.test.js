

// get usefull mocks
const fetchMock = global.fetchMock;
import storageMock from "@react-native-firebase/storage";
jest.mock("./cache");
import {getCachedHash as getCachedHashMock} from "./cache";

import {makeLocal} from ".";

describe("makeLocal", ()=>{
  beforeAll(()=>{
    getCachedHashMock.mockResolvedValue(undefined);
  })
  afterEach(()=>{
    jest.clearAllMocks();
  })

  it("runs when there is nothing to do", async ()=>{
    await expect(makeLocal({foo: "bar"})).resolves.toEqual([[], {}]);
  })

  it("downloads referenced files", async ()=> {
    const onProgress = jest.fn();
    await expect(makeLocal({
      foo: "gs://foo.appspot.com/bar.mp4"
    }, {onProgress})).resolves.toEqual(expect.anything());
    expect(onProgress).toHaveBeenCalledWith(expect.stringMatching("Downloading"))
    expect(storageMock()._writeToFile).toHaveBeenCalledTimes(1);
    expect(storageMock()._writeToFile).toHaveBeenCalledWith( "/tmp/react-native-holusion-tests/medias/bar.mp4");
  });
  it("proceed if it can't get a file's hash", async () => {
    const warnMock = jest.spyOn(global.console, "warn");
    warnMock.mockImplementationOnce(()=>{});
    const e = new Error("storage/object-not-found");
    //Error codes found at : https://firebase.google.com/docs/storage/web/handle-errors
    e.code == "storage/object-not-found";
    storageMock()._getMetadata.mockImplementationOnce(()=>Promise.reject(e));
    const [errors, files] = await makeLocal({
      foo: "gs://foo.appspot.com/bar.mp4"
    });
    expect(storageMock()._getMetadata).toHaveBeenCalledTimes(1);
    expect(errors).toHaveProperty("length", 0);
    expect(warnMock).toHaveBeenCalled();
    warnMock.mockRestore();
  });
  it("returns an array of errors if a file can't be downloaded", async ()=>{
    const e = new Error("storage/object-not-found");
    //Error codes found at : https://firebase.google.com/docs/storage/web/handle-errors
    e.code == "storage/object-not-found";
    storageMock()._writeToFile.mockImplementationOnce(()=>Promise.reject(e));
    const [errors, files] = await makeLocal({
      foo: "gs://foo.appspot.com/bar.mp4"
    });
    expect(storageMock()._writeToFile).toHaveBeenCalledTimes(1);
    expect(errors).toHaveProperty("length", 1);
    expect(files).toEqual({});
  })

  it("returns an array of downloaded files", async ()=>{
    storageMock()._writeToFile.mockImplementationOnce(()=>Promise.resolve());
    const [errors, files] = await makeLocal({
      foo: "gs://foo.appspot.com/bar.mp4"
    });
    expect(storageMock()._writeToFile).toHaveBeenCalledTimes(1);
    expect(errors).toHaveProperty("length", 0);
    expect(files).toEqual({"/tmp/react-native-holusion-tests/medias/bar.mp4": true});
  })

  it("cached files match metadata hash", async ()=>{
    storageMock()._getMetadata.mockImplementationOnce(()=>Promise.resolve({md5Hash: "xxxxx"}));
    storageMock()._writeToFile.mockImplementationOnce(()=>Promise.resolve());
    const [errors, files] = await makeLocal({
      foo: "gs://foo.appspot.com/bar.mp4"
    });
    expect(storageMock()._writeToFile).toHaveBeenCalledTimes(1);
    expect(errors).toHaveProperty("length", 0);
    expect(files).toEqual({"/tmp/react-native-holusion-tests/medias/bar.mp4": "xxxxx"});
  });

  it("recurses over nested objects", async ()=>{
    storageMock()._writeToFile.mockImplementation(()=>Promise.resolve());
    const [errors, files] = await makeLocal({
      foo: "gs://foo.appspot.com/bar.mp4",
      foofoo: {
        bar: "gs://foo.appspot.com/barbar.mp4",
      }
    });
    expect(storageMock()._writeToFile).toHaveBeenCalledTimes(2);
    expect(errors).toHaveProperty("length", 0);
    expect(files).toEqual({
      "/tmp/react-native-holusion-tests/medias/bar.mp4": true,
      "/tmp/react-native-holusion-tests/medias/barbar.mp4": true
    });
  });
  it("Will not download again the same file", async ()=>{
    storageMock()._writeToFile.mockImplementation(()=>Promise.resolve());
    storageMock()._getMetadata.mockImplementation(()=>Promise.resolve({md5Hash: "xxxxx"}));
    const [errors, files] = await makeLocal({
      foo: "gs://foo.appspot.com/bar.mp4",
      bar: "gs://foo.appspot.com/bar.mp4",
    });
    expect(storageMock()._writeToFile).toHaveBeenCalledTimes(1);
    expect(errors).toHaveProperty("length", 0);
    expect(files).toEqual({
      "/tmp/react-native-holusion-tests/medias/bar.mp4": "xxxxx",
    });
  });
})