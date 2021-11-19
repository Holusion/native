'use strict';


import '@testing-library/jest-native/extend-expect';

import {enableFetchMocks} from 'jest-fetch-mock';

import {AbortController} from "abort-controller/dist/abort-controller";
//Auto-fix AbortController until it's done upstream
global.AbortController = global.AbortController || AbortController;

class FormData{
    constructor(){
        if(!Array.isArray(FormData.data)) FormData.data = [];
    }
    static data;
    static _reset(){
        FormData.data = [];
    }
    append(d){
        FormData.data.push(d);
    }
}
//Auto-fix FormData
global.FormData = global.FormData || FormData;
enableFetchMocks();

//From react-navigation (https://reactnavigation.org/docs/testing/)
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};

  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
