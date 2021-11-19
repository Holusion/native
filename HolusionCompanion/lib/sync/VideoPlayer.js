'use strict';
import React from "react";
import PropTypes from "prop-types";
import { usePlay } from "./hooks/usePlay";
import { connect } from "react-redux";
import { useAutoPlay } from "./hooks/useAutoPlay";

/**
 * Simple wrapper around useAutoPlay that fetch the necessary data from redux and react-navigation
 * @returns {null}
 * @deprecated prefer useAutoPlay or wrapAutoPlay when possible
 */
export function VideoPlayer(){
  useAutoPlay();
  return null;
}
