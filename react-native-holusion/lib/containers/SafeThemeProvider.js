import React, {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";

import {filename} from "@holusion/cache-control";

import {loadFonts} from 'react-native-dynamic-fonts';
import { StyleProvider, Content, Spinner, Text } from 'native-base';
import { clearThemeCache } from 'native-base-shoutem-theme';

import getTheme from '../../native-base-theme/components';
import default_vars from "../../native-base-theme/variables/platform";

import { readFile } from "react-native-fs";

import {addTask, updateTask} from "../actions";
import { getPendingTasks } from "../selectors";
import { InitialLoadWrapper } from "./LoadWrapper";

const taskId = "10_required_theme";

export function  ThemeProvider({
  children
}){
  const {fonts, theme} = useSelector(state=>state.data.config);
  const dispatch = useDispatch();
  //Reset theme on each change
  useEffect(()=>{
    console.log("clearing theme cache");
    clearThemeCache();
  }, [theme]);
  useEffect(()=>{
    if(!Array.isArray(fonts)){
      dispatch(updateTask({ 
        id: taskId, 
        title: "Theme",
        message: `nothing to do`, 
        status: "success"
      }));
      return;
    };
    let aborted = false;
    dispatch(addTask({ 
      id: taskId, 
      title: "Theme",
      message: `synchronizing...`, 
      status: "pending"
    }))
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
        id: taskId, 
        message: names.length? `polices : ${names.join(", ")}`: "pas de polices",
        status: "success", 
      }));
    }).catch( (e)=>{
      console.warn("Error loading fonts", e);
      if(aborted) return;
      dispatch(updateTask({ 
        id: taskId, 
        message: `echec du chargement de : ${fonts.map(f=>filename(f)).join(", ")}`, 
        status: "warn"
      }))
    })
  }, [fonts]);
  return (<InitialLoadWrapper>
    <StyleProvider style={getTheme(Object.assign({}, default_vars, theme))}>
        {children}
    </StyleProvider>
  </InitialLoadWrapper>)
}

