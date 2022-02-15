'use strict';
import React from 'react';
import {connect} from 'react-redux';

import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, TouchableOpacity, ActivityIndicator} from 'react-native'
import {getActiveProduct, isSynchronized, getRequiredFiles, getOtherFiles, isLoaded, isSignedIn, getErrors } from "@holusion/cache-control";


class NetworkIcon extends React.Component{
    constructor(props){
      super(props);
    }
    render(){
      let color;
      if(this.props.connectedToProduct){
        color = (this.props.color)? this.props.color.on: "green";
      }else{
        color= (this.props.color)? this.props.color.off: "red";
      }
      let content = <View style={{display:"flex", flexDirection:"row"}}>
        {/*offline status is purposefully ignored */}
        {(this.props.errors && this.props.errors.length)?
        <View style={{marginTop:3, width: 30, height: 30, borderRadius: 15, backgroundColor:"orange", marginHorizontal:10}}>
          <Text style={{color:"white", fontSize: 14, lineHeight:30, textAlign:"center"}}>{this.props.errors.length}</Text>
        </View>: null}
        {this.props.isWorking  && <ActivityIndicator size="small" color='orange'/>}
        <Icon style={{marginRight: 16, color, fontSize:24}} name="ios-wifi" />
      </View>
      if(this.props.onPress){
        return  <TouchableOpacity transparent onPress={this.props.onPress}>{content}</TouchableOpacity>
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
  