
import {persistentStore, configureStore} from "./persistentStore";
import * as filesMock from "@holusion/cache-control";
import { setProjectName } from "./actions";
import { getItems, getTasks } from "./selectors";



describe("persistentStore",function (){
  beforeAll(()=>{
    filesMock.cleanup = jest.fn(()=>Promise.resolve([[], []]));
  })
  beforeEach(()=>{
    jest.clearAllMocks();
  });
  describe("configureStore", function(){
    it("can't configure projectName if set from initialization", function(){
      const s = configureStore({projectName: "foo"});
      const conf = s.getState().conf;
      expect(conf).toHaveProperty("projectName", "foo");
      expect(conf).toHaveProperty("configurableProjectName", false);
    })
    it("can configure projectName if not set from initialization", function(){
      const s = configureStore({});
      const conf = s.getState().conf;
      expect(conf).toHaveProperty("projectName", undefined);
      expect(conf).toHaveProperty("configurableProjectName", true);
    })
    it("can force projectName to be editable", function(){
      const s = configureStore({
        projectName: "foo",
        configurableProjectName: true
      });
      const conf = s.getState().conf;
      expect(conf).toHaveProperty("projectName", "foo");
      expect(conf).toHaveProperty("configurableProjectName", true);
    })
    it("is initialized with items as an empty object", function(){
      const s = configureStore({
        projectName: "foo",
        configurableProjectName: true
      });
      const items = getItems(s.getState());
      expect(items).toEqual({});
    })
  })

  it("resolves when data files are loaded", async () => {
    filesMock.saveFile = jest.fn(()=>Promise.resolve());
    filesMock.loadFile = jest.fn((name)=>{
      if(name === "data.json"){
        return Promise.resolve(JSON.stringify({config: {foo: "bar"}}));
      }else{
        return Promise.resolve(JSON.stringify({projectName: "foofoo"}));
      }
    });
    const [store, op] = persistentStore();
    await expect(op).resolves.toBeUndefined();
    expect(filesMock.loadFile).toHaveBeenCalledTimes(2);
    const tasks = store.getState().tasks.list;
    expect(tasks).toHaveProperty("local-data", expect.objectContaining({status: "success"}));
    expect(tasks).toHaveProperty("local-conf", expect.objectContaining({status: "success"}));
    expect(store.getState().data).toHaveProperty("config", {foo: "bar"});
    expect(store.getState().conf).toHaveProperty("projectName", "foofoo");
  })
  it("marks tasks as error if files were not found", async () => {
    filesMock.loadFile = jest.fn((name)=>{
      let e = new Error("Not found");
      e.code == "ENOENT";
      return Promise.reject(e);
    });
    const [store, op] = persistentStore();
    await expect(op).resolves.toBeUndefined();
    expect(filesMock.loadFile).toHaveBeenCalledTimes(2);
    const tasks = store.getState().tasks.list;
    expect(tasks).toHaveProperty("local-data", expect.objectContaining({status: "warn"}));
    expect(tasks).toHaveProperty("local-conf", expect.objectContaining({status: "warn"}));
  })
  describe("simulate first load", function(){
    beforeAll(()=>{
      filesMock.loadFile = jest.fn((name)=>{
        let e = new Error("Not found");
        e.code == "ENOENT";
        return Promise.reject(e);
      });
    })
    
    it("save files when an update occurs", async function(){
      filesMock.saveFile = jest.fn(()=>Promise.resolve());
      const [store, op] = persistentStore();
      await op;
      store.dispatch(setProjectName("fooBar"));
      expect(filesMock.saveFile).toHaveBeenCalledTimes(1);
      expect(filesMock.saveFile).toHaveBeenCalledWith("conf.json", expect.stringMatching("\"projectName\":\"fooBar\""));
    })
    it("handles saveFile errors", async function(){
      let e = new Error("Permission denied");
      e.code = "EPERM";
      filesMock.saveFile = jest.fn(()=>Promise.reject(e));
      const [store, op] = persistentStore();
      await op;
      store.dispatch(setProjectName("fooBar"));
      expect(filesMock.saveFile).toHaveBeenCalledTimes(1);
      await Promise.resolve(); // Yield
      await Promise.resolve(); // Yield again
      expect(getTasks(store.getState())).toHaveProperty("local-conf", expect.objectContaining({status: "error", message: e.message}));
    })
  })
})