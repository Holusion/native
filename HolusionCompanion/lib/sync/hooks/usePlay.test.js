import React from 'react';
import {render} from '@testing-library/react-native'

import {usePlay} from ".";

describe("usePlay()", function(){
  let onFetch;
  beforeAll(()=>{
    onFetch = jest.fn(()=>Promise.resolve({code: 200, message: "OK"}));
    fetch.doMock((req)=>onFetch(req));
  })
  afterAll(()=>{
    fetch.resetMocks()
  })
  afterEach(()=>{
    onFetch.mockClear();
  })
  function Wrapper({video, url}){
    usePlay(video, url);
    return null;
  }
  const video = "/path/to/foo.mp4";
  const url = "192.168.1.1";
  it("uses fetch if given a video and a target", ()=>{
    render(<Wrapper video={video} url={url}/>);
    expect(onFetch).toHaveBeenCalledWith(expect.objectContaining({
      method: "PUT",
      url: "http://192.168.1.1/control/current/foo.mp4"
    }))
  });
  it("Does nothing if both parameters are undefined", ()=>{
    render(<Wrapper/>);
    expect(onFetch).not.toHaveBeenCalled();
  })
  it("does nothing if video is undefined", ()=>{
    render(<Wrapper url={url}/>);
    expect(onFetch).not.toHaveBeenCalled();
  })
  it("Does nothing if url is undefined", ()=>{
    render(<Wrapper video={video}/>);
    expect(onFetch).not.toHaveBeenCalled();
  });


})