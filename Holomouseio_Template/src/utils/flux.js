import { Store } from '@holusion/react-native-holusion'
import { combineReducers } from '@holusion/react-native-holusion'

import { appState } from "../reducers/appStates";
import { selectionType } from '../reducers/selectionTypes';
import { tasks } from '../reducers/tasks';

export const store = new Store(combineReducers({
    appState,
    selectionType,
    tasks
}))