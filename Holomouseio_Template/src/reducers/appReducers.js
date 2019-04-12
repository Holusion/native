import * as appState from "../actions";

const { INIT } = appState.AppState

export const changeAppState = (state = INIT, action) => {
    switch(action.type) {
        case appState.CHANGE_STATE:
            return action.appState;
        default:
            return state;
    }
}