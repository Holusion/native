import React, {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";

import {filename} from "@holusion/cache-control";

import {loadFonts} from 'react-native-dynamic-fonts';
import { StyleProvider, Content, Spinner, Text } from 'native-base';
import { clearThemeCache } from 'native-base-shoutem-theme';

import getTheme from '../../native-base-theme/components';
import default_vars from "../../native-base-theme/variables/platform";

import { readFile } from "react-native-fs";

import {addTask, updateTask, taskIds} from "../actions";
import { InitialLoadWrapper } from "./LoadWrapper";
import { getTasks } from "../selectors";


export function  ThemeProvider({
  children
}){
  const {fonts, theme} = useSelector(state=>state.data.config);
  const loaded = useSelector(getTasks)[taskIds.theme];
  const syncFiles = useSelector(getTasks)[taskIds.requiredFiles];
  const dispatch = useDispatch();

  const useTheme = (loaded && loaded.status == "success")?true: false;
  //Reset theme on each change
  useEffect(()=>{
    if(useTheme){
      console.log("clearing theme cache");
      clearThemeCache();
    }
  }, [useTheme]);
  useEffect(()=>{
    if(!Array.isArray(fonts)){
      dispatch(updateTask({ 
        id: taskIds.theme, 
        title: "Theme",
        message: `nothing to do`, 
        status: "success"
      }));
      return;
    };
    let aborted = false;
    dispatch(addTask({ 
      id: taskIds.theme, 
      title: "Theme",
      message: `synchronizing...`, 
      status: "pending"
    }))
    if(!syncFiles || syncFiles.status !== "success") return;
    Promise.all(fonts.map(async font=>{
      const name = filename(font.slice(0, font.lastIndexOf(".")));
      //use readFile instead of loadFontFromFile because it yields out-of-band errors
      const data = await readFile(font, "base64");
      let type = /\.otf$/i.test(font)? "otf": "ttf";
      return {name, data, type};
    }))
    .then(fonts=> loadFonts(fonts))
    .then((names)=>{
      if(aborted) return;
      dispatch(updateTask({
        id: taskIds.theme, 
        message: names.length? `polices : ${names.join(", ")}`: "pas de polices",
        status: "success", 
      }));
    }).catch( (e)=>{
      console.warn("Error loading fonts", e);
      if(aborted) return;
      dispatch(updateTask({ 
        id: taskIds.theme, 
        message: `echec du chargement de : ${fonts.map(f=>filename(f)).join(", ")}`, 
        status: "warn"
      }))
    })
  }, [fonts, syncFiles, dispatch]);
  return (<InitialLoadWrapper>
    <StyleProvider style={getTheme(Object.assign({}, default_vars, useTheme?theme: {}))}>
        {children}
    </StyleProvider>
  </InitialLoadWrapper>)
}

