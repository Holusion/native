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
      if(this.props.connectedToProduct){
        color = (this.props.colors)? this.props.colors.on: "green";
      }else{
        color= (this.props.colors)? this.props.colors.off: "red";
      }
      return (<Button transparent onPress={this.props.onPress}>
        {this.props.cloudStatus === "loading" && <Icon style={{marginRight: 16, color: "blue"}} name="ios-code-working" />}
        {this.props.cloudStatus === "connected" && <Icon style={{marginRight: 16, color: "blue"}} name="ios-code-working" />}
        {this.props.cloudStatus === "rejected" && <Icon style={{marginRight: 16, color: "blue"}} name="ios-code-working" />}
        <Icon style={{marginRight: 16, color}} name="ios-wifi" />
      </Button>);
    }
  }
  
  function mapStateToProps(state){
    return {
      cloudStatus: state.network.firebase,
      connectedToProduct: (getActiveProduct(state)? true : false)
    }
  }
  
export default connect(mapStateToProps)(NetworkIcon);
  