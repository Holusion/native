'use strict';
import React from 'react';
import {connect} from 'react-redux';

import { Icon, Button, Spinner} from 'native-base';

import {getActiveProduct, getPendingSyncTasks} from "../selectors";
import {taskIds} from "../actions";


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
        {/*offline status is purposefully ignored */}
        { 0 < this.props.syncTasks.length  && <Spinner size="small" color='orange' />}
        {this.props.cloudStatus === "pending" && <Icon style={{marginRight: 16, color: "orange"}} name="ios-code-working" />}
        {this.props.cloudStatus === "success" && <Icon style={{marginRight: 16, color: "blue"}} name="ios-code-working" />}
        {this.props.cloudStatus === "rejected" && <Icon style={{marginRight: 16, color: "red"}} name="ios-code-working" />}
        <Icon style={{marginRight: 16, color}} name="ios-wifi" />
      </Button>);
    }
  }
  
  function mapStateToProps(state){
    return {
      cloudStatus: state.tasks.list[taskIds.firebase]?state.tasks.list[taskIds.firebase].status : "pending",
      syncTasks: getPendingSyncTasks(state),
      connectedToProduct: (getActiveProduct(state)? true : false)
    }
  }
  
export default connect(mapStateToProps)(NetworkIcon);
  