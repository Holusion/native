'use strict';
import {useState, useEffect} from "react";
import { AppState } from "react-native"
/**
 * 
 * @returns {"active"|"inactive"|"background"}
 */
 export function useAppState(){
  const [appState, setAppState] = useState(AppState.currentState);
  useEffect(()=>{
    let _changeListener = AppState.addEventListener('change', (nextState)=>{
      setAppState(nextState);
    });
    return ()=> _changeListener.remove();
  }, [setAppState]);
  return appState;
}
