import { AppState, CHANGE_STATE } from "../actions";

export const appState = (state = AppState.INIT, action) => {
    switch(action.type) {
        case CHANGE_STATE:
            return action.appState;
        default:
            return state;
    }
}