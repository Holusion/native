'use strict';
import { connect} from 'react-redux';
import {updateTask, setData} from "../actions";


import Downloader from "./Downloader";


export const DownloadProvider = connect((state)=>({
  projectName: state.conf.projectName,
  connected: state.network.status,
  firebaseTask: state.tasks.list["firebase"] || {status: "pending"},
}), {
  setData,
  updateTask,
})(Downloader);