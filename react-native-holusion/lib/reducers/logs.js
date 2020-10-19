'use strict';

export default function data(state = {
    logs:[],
}, action) {
  if(action.error){
    return [...state.logs, {severity: "error", message: action.error.message, timestamp: new Date()}]
  }
  return state;
}