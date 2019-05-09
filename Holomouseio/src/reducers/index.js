import { changeAppState } from "./appStates";
import { changeSelectionType } from "./selectionTypes";

export default reducers = (state = {}, action) => {
    return {
        appState: changeAppState(state.appState, action),
        selectionType: changeSelectionType(state.selectionType, action)
    }
}