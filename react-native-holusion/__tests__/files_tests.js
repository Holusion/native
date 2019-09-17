'use strict';


jest.mock('react-native-fs', ()=>{return {}} );
jest.mock('react-native-firebase', ()=>{return {}} );


import {dedupeList, filename} from "../lib/files";


describe("files dedupeList()", function(){
    function uploadFixture(uri){
        return {uri, name: filename(uri), type:"video/mp4"};
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
            {name: "foo"}
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
})