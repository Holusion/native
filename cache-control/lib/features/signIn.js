
import {firebase, auth} from "firebase";

import { getUniqueId, getApplicationName, getDeviceName } from "deviceInfo";

import { put, delay, call, cancelled } from 'redux-saga/effects'

import {setSignedIn, SET_SIGNEDIN} from "./status";

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
  while(error){
    error = yield call(doSignIn, projectName);
    if(error){
      yield put({type: SET_SIGNEDIN, error});
      yield delay(d);
      /* istanbul ignore next */
      d = d<=32768? d*2 : d;
    }
  }
  yield put(setSignedIn(projectName));
}
