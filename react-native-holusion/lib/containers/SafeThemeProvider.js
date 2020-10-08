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
import { FullLoadWrapper } from "./FullLoadWrapper";

const taskId = "load-theme";

export function  ThemeProvider({
  children
}){
  const {fonts, style} = useSelector(state=>state.data.config);
  const dispatch = useDispatch();
  //Reset theme on each style change
  useEffect(()=>{
    console.log("clearing theme cache");
    clearThemeCache();
  }, [style]);
  useEffect(()=>{
    console.log("Fonts change : ", fonts);
    if(!Array.isArray(fonts)){
      dispatch(updateTask({ 
        id: taskId, 
        message: `nothing to do`, 
        status: "success"
      }));
      return;
    };
    let aborted = false;
    dispatch(addTask({ 
      id: taskId, 
      message: `synchronizing...`, 
      status: "pending"
    }))
    Promise.all(fonts.map(async font=>{
      const name = filename(font.slice(0, font.lastIndexOf(".")));
      console.log("Loading font : ", name, font );
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
        message: `polices : ${names.join(", ")}`,
        status: "success", 
      }));
    }).catch( (e)=>{
      console.warn("Error loading font", e);
      if(aborted) return;
      dispatch(updateTask({ 
        id: taskId, 
        message: `echec du chargement de : ${fonts.map(f=>filename(f)).join(", ")}`, 
        status: "warn"
      }))
    })
  }, [fonts]);
  return (<StyleProvider style={getTheme(Object.assign({}, default_vars, style))} key={style}>
    <FullLoadWrapper >
      {children}
    </FullLoadWrapper>
  </StyleProvider>)
}

