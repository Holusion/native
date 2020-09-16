'use strict';

import { getUniqueId, getApplicationName, getDeviceName } from "react-native-device-info";

import "@react-native-firebase/functions";
import "@react-native-firebase/firestore";
import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";

export async function useSignIn(application){
  const hostname = await getDeviceName();
  const func = firebase.app().functions("europe-west1").httpsCallable("https_authDeviceCall")
  let { data: token } = await func({ 
    uuid: getUniqueId(), 
    applications: [application], 
    meta: { publicName: `${getApplicationName()}.${hostname}`} 
  });

  await auth().signInWithCustomToken(token);
}
