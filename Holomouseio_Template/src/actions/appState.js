export const CHANGE_STATE = 'CHANGE_STATE'

export const AppState = {
    INIT: 'INIT',
    DOWNLOAD_FIREBASE: 'DOWNLOAD_FIREBASE',
    SEARCH_PRODUCT: 'SEARCH_PRODUCT',
    READY: 'READY'
}

export const changeState = (appState) => {
    return {type: CHANGE_STATE, appState};
}