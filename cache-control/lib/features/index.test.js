import {runSaga} from "redux-saga";
import { takeLatest, throttle } from "redux-saga/effects";
import {testSaga, expectSaga} from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

jest.mock("../path");
import fsMock from "filesystem";
import {app as appMock, auth as autoMock} from "firebase";

import {loadLocalSaga, reducers, rootSaga, sagaStore, saveCache, dataFile} from ".";
import {SET_DATA, watchChanges, createWatcher} from "./data";
import {setConf, actions, action_strings as conf_actions_names, getProjectName} from "./conf";

import { signIn, SET_SIGNEDIN, doSignIn } from "./signIn";
import { storagePath } from "../path";
import { handleSetData, SET_CACHED_FILE, SET_DEPENDENCIES, SET_FILES } from "./files";
import {makeFileRef} from "./files/_mock_fileRef";
import { INITIAL_LOAD } from "./status";

afterEach(()=>{
  fsMock._reset();
})


describe("rootSaga", ()=>{
  test("workflow", ()=>{
    testSaga(rootSaga)
    .next()
    .call(loadLocalSaga)
    .next()
    .select(getProjectName)
    .next()
    .call(signIn, {projectName: undefined})
    .next()
    .all([
      takeLatest(actions.SET_PROJECTNAME, signIn),
      takeLatest(SET_SIGNEDIN, watchChanges),
      takeLatest(SET_DATA, handleSetData),
      throttle(1000, [SET_DATA, SET_DEPENDENCIES, SET_CACHED_FILE, ...conf_actions_names], saveCache),
    ])
    .next()
    .isDone();
  })

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
    .withReducer(reducers)
    .provide([
      [matchers.call.fn(loadLocalSaga), undefined],
    ])
    .dispatch({type: SET_SIGNEDIN, projectName: "foo"})
    .call(createWatcher, "foo")
    .dispatch({type: SET_SIGNEDIN, projectName: "bar"})
    .call(createWatcher, "bar")
    .silentRun()
  })

  test("will save conf changes to disk", ()=>{
    return expectSaga(rootSaga)
    .withReducer(reducers)
    .provide([
      [matchers.call.fn(loadLocalSaga), undefined],
    ])
    .dispatch({type: actions.SET_PROJECTNAME, projectName: "foo"})
    .fork.fn(saveCache)
    .silentRun()
  })
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
    let expectError = new Error(`${dataFile} was not present on disk`);
    fsMock.readFile.mockImplementation(()=>Promise.reject(e));
    await expectSaga(loadLocalSaga)
    .put({type: INITIAL_LOAD, error:  expectError})
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

  describe("after INITIAL_LOAD", ()=>{
    //Some smoke test to check if store properly initializes
    let store, task;
    beforeEach(()=>{
      ([store, task] = sagaStore());
      return new Promise((resolve)=>{
        const unsubscribe = store.subscribe(()=>{
          const state = store.getState();
          if(state.status.initial_load) {
            unsubscribe();
            resolve();
          }
        });
      });
    });
    afterEach(()=>{
      task.cancel();
    })

    test("save data changes to disk", (done)=>{
      store.dispatch({type:SET_DATA, data: {items: {foo: {title: "bar"}}}});
      setTimeout(()=>{
        expect(fsMock.contents).toMatchSnapshot();
        done();
      },1);
    });
    test("save conf changes to disk", (done)=>{
      store.dispatch({type:actions.SET_CONF, conf:{projectName: "foo"}});
      setTimeout(()=>{
        expect(fsMock.contents).toMatchSnapshot();
        done();
      },1);
    });
    test('save required files list to disk', (done)=>{
      store.dispatch({
        type:SET_DATA, 
        data: {items: {foo: {image: "/tmp/foo.png"}}}, 
        files: {
          "/tmp/foo.png": makeFileRef("foo.png")
        }});
      setTimeout(()=>{
        expect(fsMock.contents[`${storagePath()}/${dataFile}`]).toBeTruthy();
        expect(fsMock.contents[`${storagePath()}/${dataFile}`]).toMatchSnapshot();
        done();
      },1);
    });
  })
})