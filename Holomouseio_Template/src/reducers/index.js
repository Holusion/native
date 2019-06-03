import { changeAppState } from "./appStates";
import { changeSelectionType } from "./selectionTypes";
import { tasks } from './tasks'

export default reducers = (state = {}, action) => {
    return {
        appState: changeAppState(state.appState, action),
        selectionType: changeSelectionType(state.selectionType, action),
        tasks: tasks(state.tasks, action)
    }
}