import {Task} from '../actions'

export const tasks = (state = new Map(), action) => {
    switch(action.type) {
        case Task.SET_TASK:
            return state.set(action.name, action.task)
        case Task.REMOVE_TASK:
            state.delete(action.name);
            return state;
        case Task.CLEAR_TASK:
            state.clear();
            return state;
        default:
            return state;
    }
}