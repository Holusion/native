'use strict';
import {dedupeList, sendFiles, filename} from ".";

import fsMock from "filesystem";
import { uploadFile } from "./upload";

let warnMock;
beforeAll(()=>{
    warnMock = jest.spyOn(console, "warn");
})
afterAll(()=>{
    warnMock.mockRestore();
})

beforeEach(()=>{
    fsMock.exists.mockImplementation(()=>Promise.resolve(true));
})
afterEach(()=>{
    fsMock._reset();
    fetch.resetMocks();
})

describe("files dedupeList()", function(){
    const static_date = new Date();
    function uploadFixture(uri){
        return {uri, name: filename(uri), mtime: static_date, type:"video/mp4"};
    }
    it("returns unique uploads tasks list",function(){
        const list = [
            uploadFixture("file:///tmp/foo"),
            uploadFixture("file:///tmp/bar")
        ];
        expect(dedupeList(list)).toEqual(list);
        expect(dedupeList(list)).not.toBe(list);
    });
    it("filters strictly equal uploads", function(){
        expect(dedupeList([
            uploadFixture("file:///tmp/foo"),
            uploadFixture("file:///tmp/foo")
        ])).toEqual([uploadFixture("file:///tmp/foo")]);
    });
    it("filters strictly equal uploads", function(){
        expect(dedupeList([
            uploadFixture("file:///tmp/foo"),
            uploadFixture("file:///tmp/foo")
        ])).toEqual([uploadFixture("file:///tmp/foo")]);
    });
    it("filters elements already in playlist", function(){
        expect(dedupeList([
            uploadFixture("file:///tmp/foo"),
            uploadFixture("file:///tmp/bar")
        ],[
            {name: "foo", conf:{mtime: static_date.toJSON()}}
        ])).toEqual([uploadFixture("file:///tmp/bar")]);
    });
    it('throw an error if different files have the same name', function(){
        expect(()=>{
            dedupeList({name: "a", uri: "/path/to/a"}, {name:"a", uri: "/path/to/b"})
        }).toThrow();
    })
})

describe("files filename()", function(){
    [
        ["file:///path/to/a/file.mp4", "file.mp4"],
        ["/path/to/file.mp4", "file.mp4"],
        ["/path.with.dots/file.mp4", "file.mp4"],
        ["/path/to/file.with.dots.mp4", "file.with.dots.mp4"]
    ].forEach(function(f){
        it(`${f[0]} => ${f[1]}`, function(){
            expect(filename(f[0])).toEqual(f[1]);
        });
    })
});

describe("files uploadFile()", ()=>{

    it("throw an error if fs.exists fails", async ()=>{
        //Normally we would let fetch throw by itself but it fails badly on react-native
        fsMock.exists.mockImplementationOnce(()=>Promise.reject(new Error("No such file or directory")));
        await expect( uploadFile("http://example.com", {uri:"/path/to/file"})).rejects.toThrow("No such file or directory");
    })

    it("throw an error if fs.exists fails", async ()=>{
        //Normally we would let fetch throw by itself but it fails badly on react-native
        fsMock.exists.mockImplementationOnce(()=>Promise.resolve(false));
        await expect( uploadFile("http://example.com", {uri:"/path/to/file"})).rejects.toThrow("File does not exists");
    })
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
    describe("PUT mtime", ()=>{
        let preMocked;
        beforeEach(()=>{
            preMocked = fetch.mockResponseOnce("{}")
        });
        it("skip PUT if mtime is not provided", async ()=>{
            await expect( uploadFile("http://example.com", {uri:"/path/to/file" })).resolves.toBeUndefined();
            expect(fetch).toHaveBeenCalledTimes(1);
        })
        it("handles abort errors", async ()=>{
            preMocked.mockAbortOnce();
            await expect( uploadFile("http://example.com", {uri:"/path/to/file", mtime: new Date(0)})).rejects.toThrow(DOMException);
        })
        it("handles network errors", async ()=>{
            preMocked.mockRejectOnce(new Error("Network error"));
            await expect( uploadFile("http://example.com", {uri:"/path/to/file", mtime: new Date(0)})).rejects.toThrow("Network error");
        })
        it("throw an error on HTTP 400 response", async ()=>{
            preMocked.mockResponse(JSON.stringify({code: 400, message:"Bad Request : Foo"}), {status: 400});
            await expect( uploadFile("http://example.com", {uri:"/path/to/file", mtime: new Date(0)})).rejects.toThrow("Bad Request : Foo");
        })
        it("throw an error on HTTP 400 response with invalid body", async ()=>{
            preMocked.mockResponse("Some Error Text", {status: 400});
            await expect( uploadFile("http://example.com", {uri:"/path/to/file", mtime: new Date(0)})).rejects.toThrow("Bad Request");
        })
    })
})

describe("files sendFiles()", function(){

    it("Upload files",function(){
        const expected_uris = [
            "http://192.168.1.1/playlist",
            "http://192.168.1.1/medias",
            "http://192.168.1.1/playlist",
            "http://192.168.1.1/medias",
            "http://192.168.1.1/playlist",
        ]
        const responses = [["[]", {status: 200}]];
        while(responses.length < expected_uris.length){
            responses.push(["{}", {status: 200}])
        }
        fetch.mockResponses(...responses);

        const [abort, operation] = sendFiles({
            target: {url:"192.168.1.1"},
            videos: ["foo.mp4", "bar.mp4"],
            onStatusChange:()=>{},
        });

        return operation.then(()=>{
            expect(fetch.mock.calls.length).toEqual(expected_uris.length);
            expected_uris.forEach(function(uri, index){
                expect(fetch.mock.calls[index][0]).toEqual(uri);
            })
        });
    });
    it("filter existing files", function(){
        jest.spyOn(console, "warn");
        fetch.mockOnce(JSON.stringify([
            {name:"foo.mp4", conf:{mtime:new Date(0)}},
            {name:"bar.mp4", conf:{mtime:new Date(0)}}
        ]))

        const [abort, operation] = sendFiles({
            target: {url:"192.168.1.1"},
            videos: ["foo.mp4", "bar.mp4"],
            onStatusChange:()=>{},
        });
        return operation.then(()=>{
            expect(fetch.mock.calls.length).toEqual(1);
        });
    })
    it("can purge files", function(){
        jest.spyOn(console, "warn");
        fetch.mockResponse(""); //default mock response
        fetch.mockOnce(JSON.stringify([
            {name:"foo.mp4", conf:{mtime:new Date(0)}},
            {name:"bar.mp4", conf:{mtime:new Date(0)}},
        ]))

        const [abort, operation] = sendFiles({
            target: {url:"192.168.1.1"},
            videos: [],
            purge: true,
            onStatusChange:()=>{},
        });
        return operation.then(()=>{
            expect(fetch.mock.calls.length).toEqual(3);
            expect(fetch.mock.calls[1][1]).toMatchObject({method:"DELETE"})
            expect(fetch.mock.calls[2][1]).toMatchObject({method:"DELETE"})
        });
    })
    it("purge is optional", function(){
        fetch.mockResponse(""); //default mock response
        fetch.mockOnce(JSON.stringify([
            {name:"foo.mp4", conf:{mtime:new Date(0)}},
            {name:"bar.mp4", conf:{mtime:new Date(0)}},
        ]))

        const [abort, operation] = sendFiles({
            target: {url:"192.168.1.1"},
            videos: [],
            purge: false,
            onStatusChange:()=>{},
        });
        return operation.then(()=>{
            expect(fetch.mock.calls.length).toEqual(1);
        });
    });
    it("handles abort errors", async ()=>{
        warnMock.mockImplementationOnce(()=>{});
        fetch.mockAbortOnce();
        const [abort, operation] = sendFiles({
            target: {url:"192.168.1.1"},
            videos: [],
            purge: true,
            onStatusChange:()=>{},
        });
        await expect(operation).resolves.toBeUndefined();
        expect(warnMock).toHaveBeenCalledWith(expect.stringMatching("Aborted"));
    })
    it("handles abort errors", async ()=>{
        warnMock.mockImplementationOnce(()=>{});
        fetch.mockRejectOnce(new Error("Network Error"));
        const onStatusChange = jest.fn();
        const [abort, operation] = sendFiles({
            target: {url:"192.168.1.1"},
            videos: [],
            purge: true,
            onStatusChange: onStatusChange,
        });
        await expect(operation).resolves.toBeUndefined();
        expect(onStatusChange).toHaveBeenCalledWith(expect.objectContaining({status: "error", statusText: expect.stringMatching("Network Error")}));
    })
})