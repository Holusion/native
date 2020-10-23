

export const INITIAL_LOAD = "INITIAL_LOAD";
export const SET_NETINFO = 'SET_NETINFO';

export default function status(state = {
  initial_load: false,
  connected: false,
}, { type, value=true }) {
  switch (type) {
    case INITIAL_LOAD:
      return { ...state, initial_load: !!value };
    case SET_NETINFO:
      return {...state, connected: !!value}
    default:
      return state;
  }
}

export const isLoaded = (state) => state.status.initial_load;
export const isConnected = state => state.status.connected;

/**
 * 
 * @param {('offline'|'online')} connected
 */
export const setNetInfo = (connected)=>{
  return {type: SET_NETINFO, value: connected}
}