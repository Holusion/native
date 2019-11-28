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
      let color;
      if(this.props.connected){
        color = (this.props.colors)? this.props.colors.on: "green";
      }else{
        color= (this.props.colors)? this.props.colors.off: "red";
      }
      return (<Button transparent onPress={this.props.onPress}><Icon style={{marginRight: 16, color}} name="ios-wifi" /></Button>);
    }
  }
  
  function mapStateToProps(state){
    return {
      connected: (getActiveProduct(state)? true : false)
    }
  }
  
export default connect(mapStateToProps)(NetworkIcon);
  