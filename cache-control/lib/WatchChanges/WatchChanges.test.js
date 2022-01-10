import {once} from "events";

import { setBasePath } from "../path";
import { WatchChanges } from ".";

import {firebase} from "firebase";

import fsMock from "filesystem";

describe("WatchChanges", function(){
  let logMock;
  beforeAll(()=>{
    logMock = jest.spyOn(global.console, "info");
    logMock.mockImplementation(()=>{});
    setBasePath("/path/to/tmp");
  })
  afterAll(()=>{
    logMock.mockRestore();
  })
  beforeEach(()=>{
    jest.clearAllMocks();
    fsMock._reset();
    firebase._reset();
  })

  it("can be created", function(){
    const wf = new WatchChanges({projectName: "foo", transforms: []});
  })

  describe("check for memory leaks", ()=>{
    let warnMock;
    beforeAll(()=>{
      warnMock = jest.spyOn(global.console, "warn");
      warnMock.mockImplementation(()=>{});
    })
    beforeEach(()=>{
      warnMock.mockClear()
    })
    afterAll(()=>{
      warnMock.mockRestore();
    })

    it("can open and close DB callbacks", function(){
      let wf = new WatchChanges({projectName: "foo", transforms: []});
      expect(wf).toHaveProperty("isConnected", false);
      expect(()=>wf.watch()).not.toThrow(Error);
      expect(wf).toHaveProperty("isConnected", true);
      expect(()=>wf.close()).not.toThrow(Error); 
      expect(wf).toHaveProperty("isConnected", false);
      expect(()=>wf.watch()).not.toThrow(Error);
      expect(()=>wf.close()).not.toThrow(Error);
      expect(wf.unsubscribes.length).toEqual(0);
      expect(warnMock).not.toHaveBeenCalled();
    })

    it("Emit a warning for trivial memory leaks", function(){
      let wf = new WatchChanges({projectName: "foo", transforms: []});
      expect(()=>wf.watch()).not.toThrow(Error);
      expect(warnMock).not.toHaveBeenCalled();
      expect(()=>wf.watch()).not.toThrow(Error);
      expect(warnMock).toHaveBeenCalledTimes(1);
      expect(warnMock).toHaveBeenCalledWith(expect.stringMatching("memory leak"));
    });
  })
  describe("watch()", ()=>{
    let collection, offProjects, offConfig, configSnapshot, projectsSnapshot;
    beforeEach(()=>{
      offProjects = jest.fn();
      offConfig = jest.fn();
      configSnapshot = jest.fn(()=>offConfig);
      projectsSnapshot = jest.fn(()=>offProjects);
      collection = {
        doc: ()=>({
          onSnapshot: configSnapshot,
          collection: ()=>({
            onSnapshot: projectsSnapshot,
          }),
        }),
      }
      firebase._collection.mockImplementationOnce(()=>collection);
    });
    


    it("onConfigSnapshot can be cancelled with close()", ()=>{
      const wf = new WatchChanges({projectName: "foo"});
      wf.onConfigSnapshot = jest.fn();
      wf.watch();
      expect(configSnapshot.mock.calls[0][0]).toBeInstanceOf(Function);
      configSnapshot.mock.calls[0][0]({data: ()=>({})});
      wf.close();
      expect(wf.onConfigSnapshot).toHaveBeenCalledTimes(1);
      expect(wf.onConfigSnapshot).toHaveBeenCalledWith(
        expect.objectContaining({data:expect.anything()}), 
        expect.objectContaining({signal: expect.anything()})
      )
      expect(wf.onConfigSnapshot.mock.calls[0][1].signal.aborted).toBe(true);
    })

    it("onProjectsSnapshot can be cancelled with close()", ()=>{
      const wf = new WatchChanges({projectName: "foo"});
      wf.onProjectsSnapshot = jest.fn();
      wf.watch();
      expect(projectsSnapshot.mock.calls[0][0]).toBeInstanceOf(Function);
      projectsSnapshot.mock.calls[0][0]({docs: []})
      wf.close();
      expect(wf.onProjectsSnapshot).toHaveBeenCalledTimes(1);
      expect(wf.onProjectsSnapshot).toHaveBeenCalledWith(
        expect.objectContaining({docs:[]}), 
        expect.objectContaining({signal: expect.anything()})
      )
      expect(wf.onProjectsSnapshot.mock.calls[0][1].signal.aborted).toBe(true);
    })
    it("onConfigSnapshot can be cancelled with another call", ()=>{
      const wf = new WatchChanges({projectName: "foo"});
      wf.onConfigSnapshot = jest.fn(()=> new Promise(()=>{}));
      wf.watch();
      configSnapshot.mock.calls[0][0]({data: ()=>({})});
      expect(wf.onConfigSnapshot.mock.calls[0][1].signal.aborted).toBe(false);
      //Call it again to cancel
      configSnapshot.mock.calls[0][0]({data: ()=>({})});
      expect(wf.onConfigSnapshot.mock.calls[0][1].signal.aborted).toBe(true);
    })

    it("onProjectsSnapshot can be cancelled with another call", ()=>{
      const wf = new WatchChanges({projectName: "foo"});
      wf.onProjectsSnapshot = jest.fn();
      wf.watch();
      projectsSnapshot.mock.calls[0][0]({docs: []})
      expect(wf.onProjectsSnapshot.mock.calls[0][1].signal.aborted).toBe(false);
      projectsSnapshot.mock.calls[0][0]({docs: []})
      expect(wf.onProjectsSnapshot.mock.calls[0][1].signal.aborted).toBe(true);
    })

    it("onProjectsSnapshot can catch firestore errors", (done)=>{
      let err = new Error("Permission denied");
      err.code = "permission-denied";

      const wf = new WatchChanges({projectName: "foo"});
      wf.onProjectsSnapshot = jest.fn();
      wf.watch();
      wf.on("error", (e)=>{
        expect(e.message).toMatch(err.message);
        expect(e.message).toMatch("projectsSnapshot");
        done();
      })
      expect(projectsSnapshot.mock.calls[0][1]).toBeInstanceOf(Function);
      projectsSnapshot.mock.calls[0][1](err);
    })    
    
    it("onConfigSnapshot can catch firestore errors", (done)=>{
      let err = new Error("Permission denied");
      err.code = "permission-denied";

      const wf = new WatchChanges({projectName: "foo"});
      wf.onConfigSnapshot = jest.fn();
      wf.watch();
      wf.on("error", (e)=>{
        expect(e.message).toMatch(err.message);
        expect(e.message).toMatch("configSnapshot");
        done();
      })
      expect(configSnapshot.mock.calls[0][1]).toBeInstanceOf(Function);
      configSnapshot.mock.calls[0][1](err);
    })
  })

  describe("getOnce()", ()=>{
    let collection, configSnapshot, projectsSnapshot;
    beforeEach(()=>{
      configSnapshot = jest.fn(()=>Promise.resolve({}));
      projectsSnapshot = jest.fn(()=>Promise.resolve({docs: []}));
      collection = {
        doc: ()=>({
          get: configSnapshot,
          collection: ()=>({
            get: projectsSnapshot,
          }),
        }),
      }
      firebase._collection.mockImplementation(()=>collection);
    });
    
    it("onConfigSnapshot and onProjectsSnapshot will get called with values", async ()=>{
      const wf = new WatchChanges({projectName: "foo"});
      wf.onConfigSnapshot = jest.fn();
      wf.onProjectsSnapshot = jest.fn();
      wf.getOnce();
      await Promise.resolve();
      expect(wf.onConfigSnapshot).toHaveBeenCalledTimes(1);
      expect(wf.onProjectsSnapshot).toHaveBeenCalledTimes(1);
    })
    it("onConfigSnapshot and onProjectsSnapshotcan be cancelled", async ()=>{
      const wf = new WatchChanges({projectName: "foo"});
      wf.onConfigSnapshot = jest.fn();
      wf.onProjectsSnapshot = jest.fn();
      wf.getOnce();
      wf.close();
      await Promise.resolve();
      expect(wf.onConfigSnapshot).toHaveBeenCalledTimes(1);
      expect(wf.onConfigSnapshot.mock.calls[0][1]).toEqual(expect.objectContaining({signal: expect.anything()}));
      expect(wf.onConfigSnapshot.mock.calls[0][1].signal.aborted).toBe(true);
      expect(wf.onProjectsSnapshot).toHaveBeenCalledTimes(1);
      expect(wf.onProjectsSnapshot.mock.calls[0][1]).toEqual(expect.objectContaining({signal: expect.anything()}));
      expect(wf.onProjectsSnapshot.mock.calls[0][1].signal.aborted).toBe(true);
    })
    it("onProjectsSnapshot can catch firestore errors", (done)=>{
      let err = new Error("Permission denied");
      err.code = "permission-denied";
      projectsSnapshot.mockImplementationOnce(()=>Promise.reject(err));
      const wf = new WatchChanges({projectName: "foo"});
      wf.onProjectsSnapshot = jest.fn();
      wf.getOnce();
      wf.on("error", (e)=>{
        expect(e.message).toMatch(err.message);
        expect(e.message).toMatch("projectsSnapshot");
        done();
      })
    })
    it("will warn if called multiple times without resolving", ()=>{
      const warnMock = jest.spyOn(global.console, "warn");
      warnMock.mockImplementationOnce(()=>{});
      const wf = new WatchChanges({projectName: "foo"});
      wf.getOnce();
      expect(warnMock).not.toHaveBeenCalled();
      wf.getOnce();
      expect(warnMock).toHaveBeenCalledWith("WatchChanges.getOnce() got called when subscriptions were active. Changes will get notified twice")
      warnMock.mockRestore();
    });
    
    it("onConfigSnapshot can catch firestore errors", (done)=>{
      let err = new Error("Permission denied");
      err.code = "permission-denied";
      configSnapshot.mockImplementationOnce(()=>Promise.reject(err));
      const wf = new WatchChanges({projectName: "foo"});
      wf.onConfigSnapshot = jest.fn();
      wf.getOnce();
      wf.on("error", (e)=>{
        expect(e.message).toMatch(err.message);
        expect(e.message).toMatch("configSnapshot");
        done();
      })
    })
  })


  describe("onSnapshot callbacks", function(){
    
    let wf;
    beforeEach(()=>{
      
      wf = new WatchChanges({projectName: "foo"});
    });
    afterEach(()=>{
      wf.close();
    });
    
    it("onProjectsSnapshot ignores pages where active === false", (done)=>{
      wf.on("dispatch",(data)=>{
        expect(data).toEqual({items: {}, files: new Map()})
        done()
      });
      wf.onProjectsSnapshot({docs: [{
        exists: true,
        data: ()=>({
          active: false,
          file: "gs://foo.appspot.com/bar.mp4"
        })
      }]})
    });

    const p = {
      exists: true,
      data:()=>({
        foo: "bar",
        file: "gs://foo.appspot.com/bar.mp4"
      }), 
      id: "alice"
    };
    [
      ["onConfigSnapshot",  p],
      ["onProjectsSnapshot", {docs: [p]}]
    ].forEach(([fnName, fixture])=>{
      describe(`${fnName}`, ()=>{
        it("no transforms", function(done){
          wf.transforms = [];
          let raw_results = {
            "onConfigSnapshot": {config: {foo:"bar", file:"gs://foo.appspot.com/bar.mp4", id:"alice"}, files: new Map()},
            "onProjectsSnapshot": {items: {alice: {foo:"bar", file:"gs://foo.appspot.com/bar.mp4", id:"alice", category:"alice"}}, files: new Map()}
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

        it("can be cancelled immediately", function(done){
          const a = new AbortController();
          wf.transforms= [
            ()=>Promise.resolve([{}, new Map()]) //always async
          ];
  
          wf.on("error", function(e){
            console.error(e);
            done(new Error("error event should not be called"));
          });
          wf.on("dispatch", function(){
            done(new Error("dispatch event should not be called"));
          });
          wf[fnName](fixture, {signal: a.signal});
          a.abort();
          done();
        });

        it("can return transformed data and required files", async function(){
          let file_deps = new Map([["/path/to/tmp/medias/bar.mp4", {
            src: "gs://example.com/bar.mp4",
            hash: "xxxxxx",
            size: 24,
            dest: "/path/to/tmp/medias/bar.mp4",
            contentType: "video/mp4"
          }]])
          let raw_results = {
            "onConfigSnapshot": { config: {foo:"bar", file:"file:///path/to/tmp/medias/bar.mp4", id:"alice"}, files: file_deps},
            "onProjectsSnapshot": { items: {alice: {foo:"bar", file:"file:///path/to/tmp/medias/bar.mp4", id:"alice", category:"alice"}}, files: file_deps}
          }
          firebase.app.mockImplementation(()=>({
            storage: ()=>({
              refFromURL: ()=>({
                name: "bar.mp4",
                bucket: "example.com",
                fullPath: "bar.mp4",
                getMetadata: ()=>Promise.resolve({
                  md5Hash:"xxxxxx",
                  size: 24,
                  contentType: "video/mp4",
                })
              })
            })
          }))
          setTimeout(()=>{
            wf[fnName](fixture, {});
          }, 1);
          let [err, res] = await Promise.race([
            once(wf, "error").then(e=>([e])),
            once(wf, "dispatch").then((e)=>([null, e])),
          ]);
          expect(err).not.toBeTruthy();
          expect(res[0]).toEqual(raw_results[fnName]);
          expect(res[1]).toEqual(undefined);

        });
      })
    })
  })
});
