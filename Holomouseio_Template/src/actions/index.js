export const CHANGE_STATE = 'CHANGE_STATE'
export const CHANGE_SELECTION_TYPE = 'CHANGE_SELECTION_TYPE'
export const Task = {SET_TASK: "ADD_TASK", REMOVE_TASK: "REMOVE_TASK", CLEAR_TASK: "CLEAR_TASK"}

export const AppState = {INIT: "INIT", DOWNLOAD_FIREBASE: "DOWNLOAD_FIREBASE", LOAD_YAML: "LOAD_YAML", SEARCH_PRODUCT: "SEARCH_PRODUCT", WAIT_FOR_PRODUCT: "WAIT_FOR_PRODUCT", PRODUCT_FOUND: "PRODUCT_FOUND", READY: "READY"}
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

const setTask = (name, type, message, retry) => {
    return {type: Task.SET_TASK, name: name, task: {type: type, message: message, retry: retry}} 
}

export const setErrorTask = (name, message, retry) => {
    return setTask(name, 'danger', message, retry);
}

export const setInfoTask = (name, message) => {
    return setTask(name, 'info', message);
}

export const setWarningTask = (name, message, retry) => {
    return setTask(name, 'warn', message, retry);
}

export const setSuccessTask = (name, message) => {
    return setTask(name, 'success', message,);
}