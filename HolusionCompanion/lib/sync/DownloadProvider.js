'use strict';
import { connect} from 'react-redux';
import {updateTask, setData, taskIds} from "../actions";
import { getTasks } from '../selectors';


import Downloader from "./Downloader";


export const DownloadProvider = connect((state)=>({
  projectName: state.conf.projectName,
  connected: state.network.status,
  firebaseTask: getTasks(state)[taskIds.firebase] || {status: "pending"},
}), {
  setData,
  updateTask,
})(Downloader);