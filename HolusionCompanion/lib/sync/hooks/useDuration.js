'use strict'
import { useEffect } from "react";
import { useIsFocused, useNavigation } from '@react-navigation/native';

/**
 * trigger a `navigation.goBack()`after `duration` ms has elapsed since page has been in focus
 */
export function useDuration(d){
  const {goBack, canGoBack} = useNavigation();
  const isFocused = useIsFocused();

  useEffect(()=>{
    if(!isFocused || !canGoBack()) return;
    let timeout;
    switch(typeof d){
      case "number":
        timeout = d;
        break;
      case "string":
        timeout = parseInt(d);
        break;
      default:
        timeout = null;
    }
    if(typeof timeout !== "number"  || Number.isNaN(timeout)) return;
    const timer = setTimeout(()=>{
      goBack();
    }, d);
    return ()=>clearTimeout(timer);
  }, [isFocused, goBack, canGoBack, d]);
}
