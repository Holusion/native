
import {firebase, auth} from "firebase";

import { getUniqueId, getApplicationName, getDeviceName } from "deviceInfo";

import { put, delay, call, cancelled } from 'redux-saga/effects'

import {setSignedIn, SET_SIGNEDIN} from "./status";

import {warn} from "./logs";

export async function doSignIn(projectName){
  const hostname = await getDeviceName();
  try{
    const func = firebase.app().functions("europe-west1").httpsCallable("https_authDeviceCall")
    let { data: token } = await func({ 
      uuid: getUniqueId(), 
      applications: [projectName], 
      meta: { publicName: `${getApplicationName()}.${hostname}`} 
    });
    await auth().signInWithCustomToken(token);
    return null
  }catch(e){
    return e;
  }
}


export function* signIn({projectName}){
  let d = 512, error = true;
  if(!projectName) return;
  yield put(setSignedIn(false));
  while(true){
    error = yield call(doSignIn, projectName);
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
