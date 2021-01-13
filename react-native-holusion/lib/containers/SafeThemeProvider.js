import React, {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";

import {filename, info, error as logError, getCachedFiles} from "@holusion/cache-control";

import {loadFonts} from 'react-native-dynamic-fonts';
import { StyleProvider, Content, Spinner, Text } from 'native-base';
import { clearThemeCache } from 'native-base-shoutem-theme';

import getTheme from '../../native-base-theme/components';
import default_vars from "../../native-base-theme/variables/platform";

import { readFile } from "react-native-fs";
import { RequiredLoadWrapper } from "./LoadWrapper";



export function ThemeProvider({
  children
}){
  const [loadedFonts, setLoadedFonts] = useState([]);
  const {fonts=[], theme} = useSelector(state=>state.data.config);
  const cachedFiles = useSelector(getCachedFiles);
  const dispatch = useDispatch();
  const allFontsLoaded = fonts.filter(font=> loadedFonts.indexOf(font) === -1).length === 0;
  //console.log("Theme : ",theme, "Load : ", allFontsLoaded, "Fonts : " , fonts, "Loaded fonts : ", loadedFonts);
  //Reset theme on each change
  useEffect(()=>{
    if(allFontsLoaded){
      //console.log("clearing theme cache");
      requestAnimationFrame(()=>{
        clearThemeCache();
      });
    }
  }, [theme, allFontsLoaded]);

  useEffect(()=>{
    if(!Array.isArray(fonts)) return;
    const missingFonts = fonts.filter(font => loadedFonts.indexOf(font) === -1);
    const fontsWithAFile = missingFonts.filter(font => cachedFiles.find(f=>font.indexOf(f) !== -1));

    if(missingFonts.length === 0 || fontsWithAFile.length === 0) return;
    let aborted = false;
    Promise.all(fontsWithAFile.map(async font=>{
      const name = filename(font.slice(0, font.lastIndexOf(".")));
      //use readFile instead of loadFontFromFile because it yields out-of-band errors
      const data = await readFile(font, "base64");
      let type = /\.otf$/i.test(font)? "otf": "ttf";
      return {name, data, type};
    }))
    .then(l_fonts => loadFonts(l_fonts))
    .then((names)=>{
      if(aborted) return;
      //DISPATCH FONTS SUCCESS
      dispatch(info("FONTS", `Police${ 1< names.length?"s":""} chargée${ 1< names.length?"s":""} : ${names.join(", ")}`));
      setLoadedFonts([...loadedFonts,...fontsWithAFile]);
    }).catch( (e)=>{
      if(aborted) return;
      dispatch(logError("FONTS", "Error loading fonts : "+e.message));
    })
    return ()=> aborted = true;
  }, [fonts, loadedFonts, cachedFiles, dispatch]);

  return (<StyleProvider style={getTheme(Object.assign({}, default_vars, allFontsLoaded?theme: {}))}>
    <RequiredLoadWrapper>
        {children}
    </RequiredLoadWrapper>
    </StyleProvider>)
}
