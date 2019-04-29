export const CHANGE_STATE = 'CHANGE_STATE'
export const CHANGE_SELECTION_TYPE = 'CHANGE_SELECTION_TYPE'

export const AppState = {INIT, DOWNLOAD_FIREBASE, SEARCH_PRODUCT, READY}
export const SelectionType = {ANY_SELECTION, VISITE, CATALOGUE}

export const changeState = (appState) => {
    if(AppState[appState]) {
        return {type: CHANGE_STATE, appState};
    }
}

export const changeSelectionType = (selectionType) => {
    if(SelectionType[selectionType]) {
        return {type: CHANGE_SELECTION_TYPE, selectionType};
    }
}