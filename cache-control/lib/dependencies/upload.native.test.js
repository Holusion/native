'use strict';

jest.mock("react-native-fs");
import RNFS from "react-native-fs";
import { AbortError } from "../errors";
import { uploadFile } from "./upload.native";

beforeEach(()=>{
  RNFS.stopUpload.mockClear();
  RNFS.uploadFiles.mockClear();
  fetch.resetMocks();
})

describe("files uploadFile() - native", ()=>{

  describe("POST media", ()=>{
    it("handles abort errors", async ()=>{
      const a = new AbortController();
      RNFS.uploadFiles.mockImplementationOnce(()=>  ({jobId:10, promise: new Promise(()=>{})}));
      let r = expect( uploadFile("http://example.com", {uri:"/path/to/file"}, a.signal)).rejects.toThrow(AbortError);
      a.abort();
      await r;
      expect(RNFS.stopUpload).toHaveBeenCalledTimes(1);
      expect(RNFS.stopUpload).toHaveBeenCalledWith(10);
    });
    it("handles network errors", async ()=>{
      RNFS.uploadFiles.mockImplementationOnce(()=>({jobId: 0, promise: Promise.reject(new Error("Network error"))}));
      await expect( uploadFile("http://example.com", {uri:"/path/to/file"})).rejects.toThrow("Network error");
    })
    it("throw an error on HTTP 400 response", async ()=>{
      RNFS.uploadFiles.mockImplementationOnce(()=>({jobId: 0, promise: Promise.resolve({statusCode: 400, body: `{"code": 400, "message": "Bad Request"}`})}))
      await expect( uploadFile("http://example.com", {uri:"/path/to/file"})).rejects.toThrow("Bad Request");
    })
    it("throw an error on HTTP 400 response with invalid body", async ()=>{
      RNFS.uploadFiles.mockImplementationOnce(()=>({jobId:0, promise: Promise.resolve({statusCode: 400})}))
      await expect( uploadFile("http://example.com", {uri:"/path/to/file"})).rejects.toThrow("Upload failed (400) : undefined");
    })
  })

  describe("PUT hash", ()=>{
      it("skip PUT if hash is not provided", async ()=>{
        await expect( uploadFile("http://example.com", {uri:"/path/to/file" })).resolves.toBeUndefined();
        expect(fetch).not.toHaveBeenCalled();
      })
      it("handles abort errors", async ()=>{
        fetch.mockAbortOnce();
        await expect( uploadFile("http://example.com", {uri:"/path/to/file", hash: new Date(0)})).rejects.toThrow(DOMException);
      })
      it("handles network errors", async ()=>{
        fetch.mockRejectOnce(new Error("Network error"));
        await expect( uploadFile("http://example.com", {uri:"/path/to/file", hash: new Date(0)})).rejects.toThrow("Network error");
      })
      it("throw an error on HTTP 400 response", async ()=>{
        fetch.mockResponse(JSON.stringify({code: 400, message:"Bad Request : Foo"}), {status: 400});
        await expect( uploadFile("http://example.com", {uri:"/path/to/file", hash: new Date(0)})).rejects.toThrow("Bad Request : Foo");
      })
      it("throw an error on HTTP 400 response with invalid body", async ()=>{
        fetch.mockResponse("Some Error Text", {status: 400});
        await expect( uploadFile("http://example.com", {uri:"/path/to/file", hash: new Date(0)})).rejects.toThrow("Bad Request");
      })
  })
})