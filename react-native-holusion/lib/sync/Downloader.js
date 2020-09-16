import React from "react";
import PropTypes from "prop-types";
import {useAuth, useWatch} from "./hooks";

import {consoleLogger, toastLogger} from "./loggers";

export default function Downloader({projectName, updateTask, setData, firebaseTask, logger:loggerName="console"}){
  let logger;
  switch (loggerName){
    case "toast":
      logger = toastLogger;
      break;
    case "console":
    default:
      logger = consoleLogger;
  }
  useAuth({projectName, updateTask});
  useWatch({setData, updateTask, firebaseTask, logger});
  return null;
}

Downloader.propTypes = {
  projectName: PropTypes.string,
  updateTask: PropTypes.func.isRequired,
  setData: PropTypes.func.isRequired,
  firebaseTask: PropTypes.object.isRequired,
  logger: PropTypes.oneOf(["console", "toast"])
}