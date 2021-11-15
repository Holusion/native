'use strict';
import React from 'react';
import {connect} from 'react-redux';

import { Icon, View, Button, Spinner, Badge, Text} from 'native-base';
import {getActiveProduct, isSynchronized, getRequiredFiles, getOtherFiles, isLoaded, isSignedIn, getErrors } from "@holusion/cache-control";



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
      let content = <>
        {/*offline status is purposefully ignored */}
        {(this.props.errors && this.props.errors.length)? <Badge style={{marginTop:3}} warning>
          <Text style={{color:"white", fontSize: 14, lineHeight:14, height: 14, }}>{this.props.errors.length}</Text>
        </Badge>: null}
        {this.props.isWorking  && <Spinner size="small" color='orange' />}
        {this.props.signedIn && <Icon style={{marginRight: 16, color: "blue"}} name="ios-code-working" />}
        <Icon style={{marginRight: 16, color}} name="ios-wifi" />
      </>
      if(this.props.onPress){
        return  <Button transparent onPress={this.props.onPress}>{content}</Button>
      }else{
        return <View style={{display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingVertical: 6, height: 45, minWidth: 76}}>{content}</View>
      }
    }
  }
  
  function mapStateToProps(state){
    const connectedToProduct = (getActiveProduct(state)? true : false)
    const isWorking = getRequiredFiles(state).length !== 0 
      || getOtherFiles(state).length !== 0 
      || !isLoaded(state)
      || (connectedToProduct &&!isSynchronized(state));
    return {
      signedIn: isSignedIn(state),
      isWorking,
      connectedToProduct,
      errors: getErrors(state)
    }
  }
  
export default connect(mapStateToProps)(NetworkIcon);
  