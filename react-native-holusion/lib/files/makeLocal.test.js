

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
    expect(storageMock().refFromURL().writeToFile).toHaveBeenCalledTimes(1);
    expect(storageMock().refFromURL().writeToFile).toHaveBeenCalledWith( "/tmp/react-native-holusion-tests/medias/bar.mp4");
  });
  it("don't immediately throw on file not found exception", async ()=>{
    
  })
})