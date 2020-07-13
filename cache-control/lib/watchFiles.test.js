
import {setBasePath, createStorage} from "./path";
import {WatchFiles, transformSnapshot} from "./watchFiles";

import fsMock from "filesystem";
import {firebase as firebaseMock} from "firebase";

describe("watchFiles", function(){
  let logMock;
  let nowMock, randomMock
  beforeAll(()=>{
    logMock = jest.spyOn(global.console, "info");
    logMock.mockImplementation(()=>{});
    nowMock = jest.spyOn(global.Date, "now");
    nowMock.mockImplementation(()=> 1591002281997 )
    randomMock = jest.spyOn(global.Math, "random");
    randomMock.mockImplementation(()=>0.6312298070619418);

    setBasePath("/path/to/tmp");
  })
  afterAll(()=>{
    logMock.mockRestore();
    nowMock.mockRestore();
    randomMock.mockRestore();
  })
  beforeEach(()=>{
    jest.clearAllMocks();
  })

  it("can be created", function(){
    const wf = new WatchFiles({projectName: "foo", transforms: []});
  })

  describe("transformSnapshot", function(){
    it("works on an empty array", async()=>{
      await expect(transformSnapshot([], {
        exists: true,
        data:()=>({foo: "bar"}), 
        id: "alice"
      })).resolves.toEqual([
        {foo: "bar", id: "alice"},
        new Map(),
      ]);
    });

    it("merges files requirements", async()=>{
      await expect(transformSnapshot([
        ()=> ([{"foofoo": "barbar"}, new Map([["/path/to/bar.mp4", {hash: "xxxxxx", src:"gs://foo.appspot.com/bar.mp4"}]])]),
        ()=> ([{"foofoo": "barbar"}, new Map([["/path/to/baz.mp4", {hash: "yyyyyy", src:"gs://foo.appspot.com/baz.mp4"}]])]),
      ], {
        exists: true,
        data:()=>({foo: "bar"}), 
        id: "alice"
      })).resolves.toEqual([
        {foofoo: "barbar"},
        new Map([
          ["/path/to/bar.mp4", {hash: "xxxxxx", src:"gs://foo.appspot.com/bar.mp4"}],
          ["/path/to/baz.mp4", {hash: "yyyyyy", src:"gs://foo.appspot.com/baz.mp4"}]
        ]),
      ]);
    });
  });
  it("can open and close DB callbacks", function(){

    let wf = new WatchFiles({projectName: "foo", transforms: []});
    expect(()=>wf.watch()).not.toThrow(Error);
    expect(()=>wf.close()).not.toThrow(Error);
  })

  describe("onSnapshot callbacks", function(){
    const p={
      exists: true,
      data:()=>({
        foo: "bar",
        file: "gs://foo.appspot.com/bar.mp4"
      }), 
      id: "alice"
    }
    let wf;
    beforeEach(()=>{
      wf = new WatchFiles({projectName: "foo", transforms: []});
    });
    [
      ["onConfigSnapshot", "config", p],
      ["onProjectsSnapshot", "items", {docs: [p]}]
    ].forEach(([fnName, name, fixture])=>{

      describe(`${fnName}`, ()=>{
        it("no transforms", function(done){
          let raw_results = {
            "onConfigSnapshot": {config: {foo:"bar", file:"gs://foo.appspot.com/bar.mp4", id:"alice"}},
            "onProjectsSnapshot": {items: {alice: {foo:"bar", file:"gs://foo.appspot.com/bar.mp4", id:"alice"}}}
          }
          wf.on("error", done);
          wf.on("dispatch", function(d){
            expect(d).toEqual(raw_results[fnName]);
            done();
          });
          wf[fnName](fixture);
        });

        it("transforms errors will be caught properly", function(done){
          wf.transforms = [
            ()=>Promise.reject(new Error("Transform error"))
          ];
          wf.on("error", (e)=>{
            try{
              expect(e instanceof Error).toBe(true);
              done();
            }catch(err){ done(err)}
          });
          wf.on("dispatch", ()=>done(new Error("Dispatch event should not get called")));
          wf[fnName](fixture)
        });

        it("can be cancelled immediately", function(){
          const a = new AbortController();
          wf.transforms= [
            ()=>Promise.resolve([{}, new Map()]) //always async
          ];
  
          wf.on("error", function(){
            throw new Error("error event should not be called");
          });
          wf.on("dispatch", function(){
            throw new Error("dispatch event should not be called");
          });
          wf[fnName](fixture, {signal: a.signal});
          a.abort();
        });

        it("will download files", function(done){
          let errCb = jest.fn();
          const m = new Map([
            ["/path/to/bar.mp4", {hash: "xxxxxx", src: "gs://foo.appspot.com/bar.mp4"}]
          ])
          wf.transforms= [
            ()=>Promise.resolve([{}, new Map(m)]) //always async
          ];
          wf.getFiles = jest.fn(()=>Promise.resolve());
          wf.on("error", (e)=>{
            errCb();
          });
          wf.on("dispatch", function(){
            try{
              expect(errCb).not.toHaveBeenCalled();
              expect(wf.getFiles).toHaveBeenCalledWith({cacheName:name, files:m});
              done();
            }catch(e){
              done(e);
            }
          });
          wf[fnName](fixture)
        });

        it("emit an error if getFiles fail", (done)=>{
          wf.getFiles = ()=>Promise.reject(new Error("Internal Error"));
          wf.on("error", (e)=>{
            done();
          })
          wf[fnName](fixture);
        })
      })
    })

    describe("categories management", function(){
      it("assign string categories to a proper object", function(done){

        wf.on("error", done);
        wf.on("dispatch", function(d){
          expect(d).toEqual({config:{
            categories: [{name: "foo"}, {name:"bar"}],
            id: "alice",
          }});
          done();
        });
        wf.onConfigSnapshot({
          exists: true,
          data: ()=>({
            categories: ["foo", "bar"]
          }),
          id: "alice"
        });
      });
    })

    describe("cache management", function(){
      beforeEach(()=>{
        
      })

      it("save cache", function(done){
        const m = new Map([
          ["/path/to/bar.mp4", {hash: "xxxxxx", src: "gs://foo.appspot.com/bar.mp4"}],
          ["/path/to/baz.mp4", {hash: "yyyyyy", src: "gs://foo.appspot.com/baz.mp4"}],
        ]);

        wf.transforms = [
          ()=>Promise.resolve([{}, new Map(m)]) //always async
        ];

        wf.on("error", done);
        wf.on("dispatch", ()=> {
          try{
            expect(JSON.parse(fsMock.contents["/path/to/tmp/storage/cache.json"])).toEqual({
              config: {},
              items:{
              "/path/to/bar.mp4": "xxxxxx",
              "/path/to/baz.mp4": "yyyyyy"
              }
            });
            done();
          }catch(e){
            done(e);
          }
        });
        wf.onProjectsSnapshot({docs:[p]});
      });

      it("can be cancelled", (done)=>{
        const a = new AbortController();
        const m = new Map([
          ["/path/to/bar.mp4", {hash: "xxxxxx", src: "gs://foo.appspot.com/bar.mp4"}],
          ["/path/to/baz.mp4", {hash: "yyyyyy", src: "gs://foo.appspot.com/baz.mp4"}],
        ]);

        wf.transforms = [
          ()=>Promise.resolve([{}, new Map(m)]) //always async
        ];

        wf.on("error", done);
        wf.on("progress", (msg)=>{
          if(!a.signal.aborted) a.abort();
          else{
            try{
              let res = JSON.parse(fsMock.contents["/path/to/tmp/storage/cache.json"]);
              expect(Object.keys(res)).toEqual(["config", "items"]);
              done();
            }catch(e){
              done(e);
            }
          }
        })
        wf.onProjectsSnapshot({docs:[p]}, {signal: a.signal});
      })

      it("retrieves a list of files", async() => {
        await expect(wf.getFiles({
          cacheName:"foo", 
          files: new Map([
            ["/path/to/foo.mp4",{src: "gs://foo.mp4", hash: true}],
            ["path/to/bar.mp4", {src: "gs://bar.mp4", hash: true}],
          ])
        })).resolves.toBeUndefined();
      })
    });

  })
});
