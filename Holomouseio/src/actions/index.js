export const CHANGE_STATE = 'CHANGE_STATE'
export const CHANGE_SELECTION_TYPE = 'CHANGE_SELECTION_TYPE'

export const AppState = {INIT: "INIT", DOWNLOAD_FIREBASE: "DOWNLOAD_FIREBASE", SEARCH_PRODUCT: "SEARCH_PRODUCT", WAIT_FOR_PRODUCT: "WAIT_FOR_PRODUCT", READY: "READY"}
export const SelectionType = {ANY_SELECTION: "ANY_SELECTION", VISITE: "VISITE", CATALOGUE: "CATALOGUE"}

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