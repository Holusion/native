'use strict';
import {dedupeList, sendFiles, filename} from ".";


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


describe("files sendFiles()", function(){
    beforeEach(function(){
        fetch.resetMocks();
    })
    it("Upload files",function(){
        jest.spyOn(console, "warn");
        const expected_uris = [
            "http://192.168.1.1/playlist",
            "http://192.168.1.1/medias",
            "http://192.168.1.1/playlist",
            "http://192.168.1.1/medias",
            "http://192.168.1.1/playlist",
        ]
        const responses = [["[]", {status: 200}]]
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
        jest.spyOn(console, "warn");
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
    })
})