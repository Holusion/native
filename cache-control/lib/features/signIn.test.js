
import {testSaga, expectSaga} from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { delay, select } from 'redux-saga/effects'

import {app as appMock, auth as autoMock} from "firebase";

import {SET_SIGNEDIN} from "./status";
import {signIn, doSignIn} from "./signIn";
import { getProjectName, setProjectName } from './conf';
import {warn} from "./logs";
import { dynamic, throwError } from 'redux-saga-test-plan/providers';

describe("signIn()", ()=>{

  test("ignore invalid projectName", ()=>{
    testSaga(signIn).next()
    .select(getProjectName).next(undefined)
    .returns(undefined).next()
    .isDone();
  })

  test("sign in for projectName", ()=>{
    testSaga(signIn).next()
    .select(getProjectName).next("foo")
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
        if(effect.fn === doSignIn){
          return ((count++ < 2)? e:undefined);
        } else if (effect.args.length === 1 && Number.isInteger(effect.args[0])){
          //No way to properly match delay() !
          return undefined;
        }
        next();
      },
      select({selector}, next){
        if(selector === getProjectName) return "foo";
        else next();
      }
    })
    .call(doSignIn, "foo")
    .put({type: SET_SIGNEDIN, error: e})
    .call.like({args:[512]})
    .call(doSignIn, "foo")
    .put({type: SET_SIGNEDIN, error: e})
    .call.like({args:[1024]})
    .call(doSignIn, "foo")
    .put({type: SET_SIGNEDIN, value:"foo"})
    .run();
  })

  test("handle offline errors", ()=>{
    testSaga(signIn).next()
    .select( getProjectName).next("foo")
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
    func.mockReset();
  });
  test("call firebase function", async()=>{
    let e = new Error("Internal error");
    func.mockImplementationOnce(()=>Promise.resolve({data: "xxxxxxxxxx"}));
    await expect(doSignIn("foo")).resolves.toBe(null);
  })

  test("uses proper parameters", async()=>{
    let e = new Error("Internal error");
    func.mockImplementationOnce(()=>Promise.resolve({data: "xxxxxxxxxx"}));
    await expect(doSignIn("foo")).resolves.toBe(null);
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith({ 
      uuid: "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9",
      applications: ["foo"], 
      meta: { publicName: `HolusionCompanion.example#FCDBD8EF`} 
    });
  })
  test("returns an error on failure", async()=>{
    let e = new Error("Internal error");
    func.mockImplementationOnce(()=>Promise.reject(new Error("booh")));
    await expect(doSignIn("foo")).resolves.toEqual(new Error("booh"));
  })
})