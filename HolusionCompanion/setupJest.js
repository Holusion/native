'use strict';


import '@testing-library/jest-native/extend-expect';

import {enableFetchMocks} from 'jest-fetch-mock';

enableFetchMocks();

//From react-navigation (https://reactnavigation.org/docs/testing/)
import 'react-native-gesture-handler/jestSetup';


// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
