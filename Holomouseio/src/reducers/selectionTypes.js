import { SelectionType, CHANGE_SELECTION_TYPE } from '../actions'

export const changeSelectionType = (state = SelectionType.ANY_SELECTION, action) => {
    switch(action.type) {
        case CHANGE_SELECTION_TYPE:
            return action.selectionType;
        default:
            return state;
    }
}