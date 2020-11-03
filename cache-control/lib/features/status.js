

export const INITIAL_LOAD = "INITIAL_LOAD";
export const SET_NETINFO = 'SET_NETINFO';
export const SET_SIGNEDIN = "SET_SIGNEDIN";
export const SET_SYNCHRONIZED = "SET_SYNCHRONIZED";

export default function status(state = {
  initial_load: false,
  connected: false,
  signedIn: false,
  synchronized: false,
}, { type, error, value=true}) {
  switch (type) {
    case INITIAL_LOAD:
      //Initial load is always set to true even if it had an error
      return { ...state, initial_load: !!value };
    case SET_NETINFO:
      return {...state, connected: !!value};
    case SET_SIGNEDIN:
      return {...state, signedIn: error? false : !!value};
    case SET_SYNCHRONIZED:
      return {...state, synchronized: error? false : !!value}
    default:
      return state;
  }
}

export const isLoaded = (state) => state.status.initial_load;
export const isConnected = state => state.status.connected;
export const isSignedIn = (state) => state.status.signedIn;
export const isSynchronized = (state)=> state.status.synchronized;

/**
 * 
 * @param {('offline'|'online')} connected
 */
export const setNetInfo = (connected)=>{
  return {type: SET_NETINFO, value: connected}
}

export const setSignedIn = (value)=>{
  if(value instanceof Error) {
    return {type: SET_SIGNEDIN, error: value};
  }
  return {type: SET_SIGNEDIN, value};
}

export const setSynchronized = (value) =>{
  if(value instanceof Error) {
    return {type: SET_SYNCHRONIZED, error: value};
  }
  return {type: SET_SYNCHRONIZED, value};
}