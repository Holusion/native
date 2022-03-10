import {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";

import {filename, info, error as logError, getCachedFiles} from "@holusion/cache-control";

import {loadFonts} from 'react-native-dynamic-fonts';

import { readFile } from "react-native-fs";

export default function useFonts(){
  const [loadedFonts, setLoadedFonts] = useState([]);
  const themeFonts = useSelector(state=>state.data.config.themeVariables?.fonts) || {};
  const oldFonts = useSelector(state => state.data.config.fonts) || [] //prevent old apps from crash
  const cachedFiles = useSelector(getCachedFiles);
  const dispatch = useDispatch();

  const fonts = [...Object.values(themeFonts), ...oldFonts]

  const allFontsLoaded = fonts.filter(font=> loadedFonts.indexOf(font) === -1).length === 0;


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

  return allFontsLoaded;
}
