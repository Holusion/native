'use strict';
import products from "./products";
import network from "./network";
import data from "./data";
import tasks from "./tasks";
import conf from "./conf";


import {combineReducers} from "redux";
export default combineReducers({
  products,
  network,
  data,
  tasks,
  conf,
});