'use strict';
import {Image} from "react-native";
import { connect} from 'react-redux'

import {diplayName} from "./package.json"

function mapStateToProps(state, props){
  const {config} = state;
  return {
      source: (config && config.title)? {uri: config.title} : props.placeholder,
  };
}

export default connect(mapStateToProps, {})(Image);


