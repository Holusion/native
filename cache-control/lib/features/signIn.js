
import {firebase, auth} from "firebase";

import { getUniqueId, getApplicationName, getDeviceName } from "deviceInfo";

import { put, delay, call, select } from 'redux-saga/effects'

import {setSignedIn, SET_SIGNEDIN} from "./status";

import {warn} from "./logs";
import { getProjectName } from "./conf";

export const DO_SIGNIN = "DO_SIGNIN";

export async function doSignIn(projectName){
  const hostname = await getDeviceName();
  const uuid = await getUniqueId(); //Unique and reasonably persistent
  //Ridiculously low entropy but we just need to avoid possible hostname collision
  const shortId = uuid.slice(0, 8);
  try{
    const func = firebase.app().functions("europe-west1").httpsCallable("https_authDeviceCall")
    let { data: token } = await func({ 
      uuid, //Used as a "password"
      applications: [projectName], 
      meta: { publicName: `${getApplicationName()}.${hostname}#${shortId}`} 
    });
    await auth().signInWithCustomToken(token);
    return null;
  }catch(e){
    return e;
  }
}


export function* signIn(){
  let d = 512;
  const projectName = yield select(getProjectName);
  if(!projectName) return;
  yield put(setSignedIn(false));
  while(true){
    let error = yield call(doSignIn, projectName);
    if(!error) break;
    if(/internet.*offline/i.test(error.message)){
      //httpsCallable error from firebase iOS SDK has no code for "offline"
      //It yield an useless error with code unknown
      yield put(warn(SET_SIGNEDIN, "Impossible de se connecter", "la tablette n'est probablement pas reliée à internet"))
    }else{
      yield put(setSignedIn(error));
    }
    yield delay(d);
    /* istanbul ignore next */
    if(d <= 32768){
      d = d*2;
    }else{
      return;
    }
  }
  yield put(setSignedIn(projectName));
}

export function trySignIn(){
  return {type: DO_SIGNIN};
}