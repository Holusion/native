'use strict';

jest.mock("react-native-fs");
import timers from "timers/promises";
import Upload from "react-native-background-upload";
import { AbortError } from "../errors";
import { uploadFile } from "./upload.native";



describe("files uploadFile() - native", ()=>{
  beforeEach(()=>{
    Upload._getResponse.mockReset();
    Upload._getResponse.mockImplementation((id)=>Upload._.emit("completed-"+id,{
      responseCode: 200,
      responseBody: JSON.stringify({code: 200, message: "OK"}),
    }));
    fetch.resetMocks();
  })
  describe("POST media", ()=>{
    it("handles abort errors", async ()=>{
      const a = new AbortController();
      Upload._getResponse.mockImplementationOnce(()=> {});
      let r = expect( uploadFile("http://example.com", {uri:"/path/to/file.mp4", name:"file.mp4"}, a.signal)).rejects.toThrow(AbortError);
      await timers.setTimeout(2);
      a.abort();
      await r;
      expect(Upload.cancelUpload).toHaveBeenCalledTimes(1);
    });
    it("handles network errors", async ()=>{
      Upload._getResponse.mockImplementation((id)=> {
        Upload._.emit("error-"+id, new Error("Network error"));
      });
      await expect( uploadFile("http://example.com", {uri:"/path/to/file.mp4", name:"file.mp4"})).rejects.toThrow("Network error");
    })
    it("throw an error on HTTP 400 response", async ()=>{
      Upload._getResponse.mockImplementation((id)=> {
        Upload._.emit("completed-"+id, {
          responseCode:400,
          responseBody: JSON.stringify({code: 400, message: "Bad Request"})
        });
      });
      await expect( uploadFile("http://example.com", {uri:"/path/to/file.mp4", name:"file.mp4"})).rejects.toThrow("Bad Request");
    })
    it("throw an error on HTTP 400 response with invalid body", async ()=>{
      Upload._getResponse.mockImplementation((id)=> {
        Upload._.emit("completed-"+id, {
          responseCode:400,
          responseBody: JSON.stringify({code: 400})
        });
      });
      await expect( uploadFile("http://example.com", {uri:"/path/to/file.mp4", name:"file.mp4"})).rejects.toThrow("Upload failed (400) : {\"code\":400}");
    })
  })

  describe("PUT hash", ()=>{
      it("skip PUT if hash is not provided", async ()=>{
        await expect( uploadFile("http://example.com", {uri:"/path/to/file.mp4", name:"file.mp4"})).resolves.toBeUndefined();
        expect(fetch).not.toHaveBeenCalled();
      })
      it("handles abort errors", async ()=>{
        fetch.mockAbortOnce();
        await expect( uploadFile("http://example.com", {uri:"/path/to/file.mp4", name:"file.mp4", hash: new Date(0)})).rejects.toThrow(DOMException);
      })
      it("handles network errors", async ()=>{
        fetch.mockRejectOnce(new Error("Network error"));
        await expect( uploadFile("http://example.com", {uri:"/path/to/file.mp4", name:"file.mp4", hash: new Date(0)})).rejects.toThrow("Network error");
      })
      it("throw an error on HTTP 400 response", async ()=>{
        fetch.mockResponse(JSON.stringify({code: 400, message:"Bad Request : Foo"}), {status: 400});
        await expect( uploadFile("http://example.com", {uri:"/path/to/file.mp4", name:"file.mp4", hash: new Date(0)})).rejects.toThrow("Bad Request : Foo");
      })
      it("throw an error on HTTP 400 response with invalid body", async ()=>{
        fetch.mockResponse("Some Error Text", {status: 400});
        await expect( uploadFile("http://example.com", {uri:"/path/to/file.mp4", name:"file.mp4", hash: new Date(0)})).rejects.toThrow("Bad Request");
      })
  })
})