import { SelectionType, CHANGE_SELECTION_TYPE } from '../actions'

export const selectionType = (state = SelectionType.ANY_SELECTION, action) => {
    switch(action.type) {
        case CHANGE_SELECTION_TYPE:
            return action.selectionType;
        default:
            return state;
    }
}