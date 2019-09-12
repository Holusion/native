'use strict';
import React from 'react';
import {connect} from 'react-redux';

import { Icon, Button} from 'native-base';

import {getActiveProduct} from "../selectors";

class NetworkIcon extends React.Component{
    constructor(props){
      super(props);
    }
    render(){
      return (<Button transparent onPress={this.props.onPress}><Icon style={{marginRight: 16, color: this.props.connected?"green": "red"}} name="ios-wifi" /></Button>);
    }
  }
  
  function mapStateToProps(state){
    return {
      connected: (getActiveProduct(state)? true : false)
    }
  }
  
export default connect(mapStateToProps)(NetworkIcon);
  