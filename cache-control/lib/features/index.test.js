import {runSaga} from "redux-saga";
import { takeLatest, throttle } from "redux-saga/effects";
import {testSaga, expectSaga} from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

jest.mock("../path");
import fsMock from "filesystem";
import {app as appMock, auth as autoMock} from "firebase";

import {loadLocalSaga, reducers, rootSaga, sagaStore, saveCache, dataFile, getPersistentState} from ".";
import {SET_DATA, watchChanges, createWatcher} from "./data";
import {setConf, actions, action_strings as conf_actions_names, getProjectName, getWatch, setProjectName} from "./conf";

import { signIn, doSignIn } from "./signIn";
import { storagePath } from "../path";

import {makeFileRef} from "./files/_mock_fileRef";
import { INITIAL_LOAD, isLoaded, setSignedIn } from "./status";
import { saveFile } from "../readWrite";

afterEach(()=>{
  fsMock._reset();
})

describe("rootSaga", ()=>{

  test("will auth initially if projectName is set", ()=>{
    let s = reducers(undefined, setConf({projectName:"foo"}))
    return expectSaga(rootSaga)
    .withReducer(reducers, s)
    .provide([
      [matchers.call.fn(loadLocalSaga), undefined],
    ])
    .call(doSignIn, "foo")
    .silentRun()
  })

  test("will reset change listeners on re-auth", ()=>{
    return expectSaga(rootSaga)
    .withReducer(reducers, )
    .provide([
      [matchers.call.fn(loadLocalSaga), undefined],
    ])
    .dispatch(setSignedIn("foo"))
    .call(createWatcher, "foo")
    .dispatch(setSignedIn("bar"))
    .call(createWatcher, "bar")
    .silentRun()
  })

  test("will save conf changes to disk", ()=>{
    return expectSaga(rootSaga)
    .withReducer(reducers)
    .provide({
      call(effect, next){
        if(effect.fn === loadLocalSaga) return undefined;
        next();
      },
      fork(effect, next){
        if(effect.fn.name == "debounceHelper") return takeLatest(...effect.args.slice(1));
        next();
      }
    })
    .dispatch({type: actions.SET_PROJECTNAME, projectName: "foo"})
    .delay(600)
    .fork.fn(saveCache)
    .silentRun()
  })
})

describe("saveCache()", ()=>{
  test("handle saveFile error", ()=>{
    let s = {
      files: "files_foo",
      data: "data_foo",
      conf: "conf_foo"
    }
    let e = new Error("Booh");
    testSaga(saveCache).next()
    .select(getPersistentState).next(s)
    .call(JSON.stringify, s).next("stringified_state")
    .call(saveFile, dataFile, "stringified_state").throw(e)
    .put({type:"SAVE_CACHE", error: e}).next()
    .isDone();
  });
})

describe("loadLocalSaga", function(){
  test("dataFile is properly set", ()=>{
    expect(dataFile).toMatch(/data_v\d+\.json/i);
  })
  test("Load local files", async ()=>{
    fsMock._set(`${storagePath()}/${dataFile}`, JSON.stringify({
      data: {config: {foo: "bar"}},
      conf: {projectName: "foofoo"},
      files: {
        list:{},
        cache: {"/tmp/list.png":"xxxxxx"}
      }
    }));

    await expectSaga(loadLocalSaga)
    .put({
      type: INITIAL_LOAD, 
      data: {config: {foo: "bar"}},
      conf: {projectName: "foofoo"},
      files: { list:{}, cache: {"/tmp/list.png":"xxxxxx"}}
    })
    .run()
    .then((result)=>{
      expect(result.storeState).toMatchSnapshot();
    })
  });
  
  test("Handle local files absence", async ()=>{
    let e = new Error(`no such file or directory`);
    e.code = "ENOENT";
    fsMock.readFile.mockImplementation(()=>Promise.reject(e));
    await expectSaga(loadLocalSaga)
    .put({ type: 'LOG_INFO',
      name: 'INITIAL_LOAD',
      message: 'data_v1.json n\'existait pas',
      context: 'Soit c\'est une nouvelle installation soit le fichier a été perdu' 
    })
    .run();
  });
  test("Handle EACCESS error", async ()=>{
    let e = new Error(`permission denied`);
    e.code = "EACCESS";
    fsMock.readFile.mockImplementation(()=>Promise.reject(e));
    await expectSaga(loadLocalSaga)
    .put({type: INITIAL_LOAD, error: new Error(`Could not load ${dataFile} : permission denied`)})
    .run()
  });
})

describe("sagaStore()", ()=>{
  let func = jest.fn(), signInWithCustomToken = jest.fn();
  beforeEach(()=>{
    signInWithCustomToken.mockReset();
    signInWithCustomToken.mockImplementation(()=>Promise.resolve());
    autoMock.mockImplementation(()=>({
      signInWithCustomToken,
    }))
    appMock.mockImplementation(()=>({
      functions: jest.fn(()=>({
        httpsCallable: jest.fn(()=>func)
      }))
    }));
  });
  test("creates a connected store on initial load", ()=>{
    const [store] = sagaStore();
    return expect(Promise.race([
      new Promise((_, reject)=> setTimeout(()=>reject(new Error(`store does not match required shape : ${JSON.stringify(store.getState())}`), 100))),
      new Promise(resolve => {
        const unsubscribe = store.subscribe(()=>{
          let state = store.getState()
          if(state.status.initial_load) {
            unsubscribe();
            resolve(state);
          };
        })

      }),
    ])).resolves.toEqual(expect.objectContaining({
      //Maybe do assertions on initial store state
    }));
  });

  test("can set a pre-defined default project name", ()=>{
    const [store, task] =sagaStore({defaultProject: "holodemo"});
    expect(getProjectName(store.getState())).toEqual("holodemo");
    task.cancel();
  })

  describe("after INITIAL_LOAD", ()=>{
    //Some smoke test to check if store properly initializes
    let store, task;
    beforeEach(()=>{
      jest.useFakeTimers();
      ([store, task] = sagaStore());
      return new Promise((resolve)=>{
        const unsubscribe = store.subscribe(()=>{
          const state = store.getState();
          if(isLoaded(state)) {
            unsubscribe();
            resolve();
          }
        });
      });
    });

    afterEach(()=>{
      task.cancel();
    })

    async function doDebounce(){
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    }
    test("save data changes to disk", async ()=>{
      store.dispatch({type:SET_DATA, data: {items: {foo: {title: "bar"}}}});
      await doDebounce();
      expect(fsMock.contents).toMatchSnapshot();
    });
    test("save conf changes to disk", async ()=>{
      store.dispatch({type:actions.SET_CONF, conf:{projectName: "foo"}});
      await doDebounce();
      expect(fsMock.contents).toMatchSnapshot();
    });
    test('save required files list to disk', async ()=>{
      store.dispatch({
        type:SET_DATA, 
        data: {items: {foo: {image: "/tmp/foo.png"}}}, 
        files: {
          "/tmp/foo.png": makeFileRef("foo.png")
        }
      });
      await doDebounce();
      expect(fsMock.contents[`${storagePath()}/${dataFile}`]).toBeTruthy();
      expect(fsMock.contents[`${storagePath()}/${dataFile}`]).toMatchSnapshot();
    });
  })
})