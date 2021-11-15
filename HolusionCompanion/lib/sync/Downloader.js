import React from "react";
import PropTypes from "prop-types";
import {useAuth, useCleanup, useWatch, useDownload} from "./hooks";


export default function Downloader({projectName, updateTask, setData, firebaseTask}){
  useAuth({projectName, updateTask});
  useWatch({setData, updateTask, firebaseTask});
  useDownload({updateTask});
  useCleanup();
  return null;
}

Downloader.propTypes = {
  projectName: PropTypes.string,
  updateTask: PropTypes.func.isRequired,
  setData: PropTypes.func.isRequired,
  firebaseTask: PropTypes.object.isRequired,
}