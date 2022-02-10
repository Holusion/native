import { useEffect, useState } from 'react';
import RNIosSettingsBundle from 'react-native-ios-settings-bundle';
 
export function useSettings(key){
    const [value, setValue] = useState()

    useEffect(() => {
        RNIosSettingsBundle.get(key,(err,v)=>{
            if(v && !err)
                setValue(v);
            else
                console.log(err);
        }) 
    },[value])
    
    return value
}

