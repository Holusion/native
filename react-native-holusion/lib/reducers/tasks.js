'use strict';
import { SET_NETINFO, SET_FIREBASEINFO, ADD_TASK, REMOVE_TASK, UPDATE_TASK } from '../actions'

export default function tasks(state = { list: {} }, {type, id, ...action}) {
  let list;
  switch (type) {
    case UPDATE_TASK:
      return Object.assign({}, state, {
        list: {
          ...state.list,
          [id]: Object.assign({}, state.list[id], action),
        },
      });
    case ADD_TASK:
      return Object.assign({}, state, {
        list: {
          ...state.list,
          [id]: action,
        },
      });

    case REMOVE_TASK:
      const {[id]: _, ...list} = {...state.list};
      return Object.assign({}, state, {
        list,
      });
    default:
      return state;
  }
}