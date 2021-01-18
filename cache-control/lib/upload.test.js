'use strict';

import fsMock from "filesystem";
import { uploadFile } from "./upload";

beforeEach(()=>{
  fetch.resetMocks();
})

describe("files uploadFile() - node", ()=>{

  describe("POST media", ()=>{
      it("handles abort errors", async ()=>{
          fetch.mockAbortOnce();
          await expect( uploadFile("http://example.com", {uri:"/path/to/file"})).rejects.toThrow(DOMException);
      })
      it("handles network errors", async ()=>{
          fetch.mockRejectOnce(new Error("Network error"));
          await expect( uploadFile("http://example.com", {uri:"/path/to/file"})).rejects.toThrow("Network error");
      })
      it("throw an error on HTTP 400 response", async ()=>{
          fetch.mockResponse(JSON.stringify({code: 400, message:"Bad Request : Foo"}), {status: 400});
          await expect( uploadFile("http://example.com", {uri:"/path/to/file"})).rejects.toThrow("Bad Request : Foo");
      })
      it("throw an error on HTTP 400 response with invalid body", async ()=>{
          fetch.mockResponse("Some Error Text", {status: 400});
          await expect( uploadFile("http://example.com", {uri:"/path/to/file"})).rejects.toThrow("Bad Request");
      })
  })
  describe("PUT hash", ()=>{
      let preMocked;
      beforeEach(()=>{
          preMocked = fetch.mockResponseOnce("{}") // Initial upload
      });
      it("skip PUT if hash is not provided", async ()=>{
          await expect( uploadFile("http://example.com", {uri:"/path/to/file" })).resolves.toBeUndefined();
          expect(fetch).toHaveBeenCalledTimes(1);
      })
      it("handles abort errors", async ()=>{
          preMocked.mockAbortOnce();
          await expect( uploadFile("http://example.com", {uri:"/path/to/file", hash: new Date(0)})).rejects.toThrow(DOMException);
      })
      it("handles network errors", async ()=>{
          preMocked.mockRejectOnce(new Error("Network error"));
          await expect( uploadFile("http://example.com", {uri:"/path/to/file", hash: new Date(0)})).rejects.toThrow("Network error");
      })
      it("throw an error on HTTP 400 response", async ()=>{
          preMocked.mockResponse(JSON.stringify({code: 400, message:"Bad Request : Foo"}), {status: 400});
          await expect( uploadFile("http://example.com", {uri:"/path/to/file", hash: new Date(0)})).rejects.toThrow("Bad Request : Foo");
      })
      it("throw an error on HTTP 400 response with invalid body", async ()=>{
          preMocked.mockResponse("Some Error Text", {status: 400});
          await expect( uploadFile("http://example.com", {uri:"/path/to/file", hash: new Date(0)})).rejects.toThrow("Bad Request");
      })
  })
})