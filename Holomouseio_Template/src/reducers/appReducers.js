import * as appState from "../actions/appState";

const { INIT } = appState.AppState

export const changeAppState = (state = INIT, action) => {
    switch(action.type) {
        case appState.CHANGE_STATE:
            return action.appState;
        default:
            return state;
    }
}

export default app = (state = {}, action) => {
    return {
        appState: changeAppState(state.appState, action)
    }
}