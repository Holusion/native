
import {testSaga, expectSaga} from 'redux-saga-test-plan';

import {app as appMock, auth as autoMock} from "firebase";

import {SET_SIGNEDIN} from "./status";
import {signIn, doSignIn} from "./signIn";
import * as matchers from 'redux-saga-test-plan/matchers';
import {throwError, dynamic} from "redux-saga-test-plan/providers"
import { delay } from 'redux-saga/effects';
import { setProjectName } from './conf';
import {warn} from "./logs";

describe("signIn", ()=>{

  test("ignore invalid projectName", ()=>{
    testSaga(signIn, {projectName: undefined}).next()
    .returns(undefined).next()
    .isDone();
  })

  test("sign in for projectName", ()=>{
    testSaga(signIn, setProjectName("foo")).next()
    .put({type: SET_SIGNEDIN, value: false}).next()
    .call(doSignIn, "foo").next()
    .put({type:SET_SIGNEDIN, value: "foo"}).next()
    .isDone();
  })

  test("Retry after an error", ()=>{
    let e = new Error("Internal error");
    let count = 0;
    return expectSaga(signIn, setProjectName("foo"))
    .provide({
      call(effect, next){
        if(effect.fn === doSignIn) return [e, e][count++];
        else if (effect.args.length === 1 && Number.isInteger(effect.args[0])){
          //No way to properly match delay() !
          return undefined;
        }
        next();
      },
    })
    .call(doSignIn, "foo")
    .put({type: SET_SIGNEDIN, error: e})
    .call.like({args:[512]})
    .call(doSignIn, "foo")
    .put({type: SET_SIGNEDIN, error: e})
    .call.like({args:[1024]})
    .call(doSignIn, "foo")
    .put({type: SET_SIGNEDIN, value:"foo"})
    .run(256);
  })

  test("handle offline errors", ()=>{
    testSaga(signIn, setProjectName("foo")).next()
    .put({type: SET_SIGNEDIN, value: false}).next()
    .call(doSignIn, "foo").next(new Error("The Internet connection appears to be offline."))
    .put(warn(SET_SIGNEDIN, "Impossible de se connecter", "la tablette n'est probablement pas reliée à internet")).next()
    .finish();
  })
});

describe("doSignIn()", ()=>{

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
  test("call firebase function", async()=>{
    let e = new Error("Internal error");
    func.mockImplementationOnce(()=>Promise.resolve({data: "xxxxxxxxxx"}));
    await expect(doSignIn("foo")).resolves.toBe(null);
  })
  test("returns an error on failure", async()=>{
    let e = new Error("Internal error");
    func.mockImplementationOnce(()=>Promise.reject(new Error("booh")));
    await expect(doSignIn("foo")).resolves.toEqual(new Error("booh"));
  })
})