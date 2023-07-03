'use strict';
import {SET_DATA} from "./data";
import { SET_ACTIVE_PRODUCT } from "./products";

export const ADD_LOG = "ADD_LOG";
export const LOG_INFO = "LOG_INFO";
export const LOG_WARN = "LOG_WARN";
export const LOG_ERROR = "LOG_ERROR";

export const addLine = (state, severity, {message, name, context})=> {
  let currentId = state.idCount +1;
  let errors = severity !== "error" ? state.errors: {...state.errors, [name]: currentId};
  let lines = [
    ...state.lines, 
    {id: currentId, severity, name: name, message: `${message}`, context, timestamp: new Date()}
  ];
  let slicedLines = [
    ...lines.slice(0, -100).filter(l => Object.keys(errors).findIndex((k)=>errors[k] === l.id) !== -1 ),
    ...lines.slice(-100)
  ];
  return {
    idCount: currentId,
    errors,
    lines: slicedLines,
  };
}

export default function logs(state = {
  idCount: 1,
  lines:[],  
  errors:{},
}, action) {
  if(action.error){
    return addLine(state, "error", {
      message: action.error.message,
      name: action.type,
      context: action.error.context || action.error.toString(),
    });
  }
  let clean_state = state;
  if(state.errors[action.type]){
    let {[action.type]:_, ...errors} = state.errors;
    clean_state = {...state, errors};
  }
  switch(action.type){
    case LOG_INFO:
      return addLine(clean_state , "info", action);
    case LOG_WARN:
      return addLine(clean_state , "warn", action);
    case LOG_ERROR:
      return addLine(clean_state , "error", action);
    case SET_DATA:
      if(action.data["items"]){
        return addLine(clean_state, "info", {message: "Mise à jour des pages", name: SET_DATA, context: `Réception de ${Object.keys(action.data["items"]).length} pages` })
      }else{
        return addLine(clean_state, "info", {message: "Mise à jour du projet", name: SET_DATA, context: `Configuration : ${JSON.stringify(action.data, null, 2)}` })
      }
    case SET_ACTIVE_PRODUCT:
      return addLine(clean_state, "info", {message: `Connexion à ${action.name}`, name:SET_ACTIVE_PRODUCT});
    default:
      return clean_state ;
  }
}


export const getLogs = (state)=> state.logs.lines;

export const getErrors = (state)=> {
  let lines = getLogs(state);
  return Object.keys(state.logs.errors).map(name => lines.filter(l=>l.id === state.logs.errors[name])).flat();
}

export const getError = (state, name)=>{
  return getErrors(state).find(e=> e.name === name);
}

/**
 * @typedef {object} LogAction
 * @property {typeof LOG_INFO|typeof LOG_WARN|typeof LOG_ERROR} type
 * @property {string} name generally the type of the action that called the event is used
 * @property {string} message
 * @property {string} [context]
 */

/**
 * 
 * @returns {LogAction}
 */
export const log = (severity, nameOrMessage, message, context)=>{
  return {type:severity, name: message?nameOrMessage: severity.split("_").slice(-1)[0].toUpperCase(), message:message? message:nameOrMessage, context};
}
/**
 * 
 * @param  {string} [name] A custom log name
 * @param {string} message - the log's main message
 * @param {string} [context] - optionnal extended context
 */
export const info = (...args)=> log(LOG_INFO, ...args);
export const warn = (...args)=> log(LOG_WARN, ...args);
export const error = (...args)=> log(LOG_ERROR, ...args);
