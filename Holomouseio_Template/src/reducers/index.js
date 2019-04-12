import { changeAppState } from "./appReducers";

export default reducers = (state = {}, action) => {
    return {
        appState: changeAppState(state.appState, action)
    }
}