import { useEffect, useState } from 'react';
import RNIosSettingsBundle from 'react-native-ios-settings-bundle';
 
import { useAppState } from './useAppState';

export function useSettings(key){
    const [value, setValue] = useState()
    const appState = useAppState();
    //Force effect to reload when app comes out of background mode
    const isActive = appState === "active";
    useEffect(() => {
      if(!isActive) return;
      RNIosSettingsBundle.get(key, (err, v)=>{
        if(!err && v !== value)
          setValue(v);
        else if (err)
          console.error("iOS settings error : ", err);
      });
    },[value, isActive]);
    
    return value
}

