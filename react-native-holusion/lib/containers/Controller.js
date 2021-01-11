import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { useRoute } from '@react-navigation/native';

import { PrevNext, PlayPause, SpriteCube } from "../components";
import {StyleSheet} from "react-native";
import { View } from "native-base";
import { getActiveProduct } from "@holusion/cache-control";

//{["default", "buttons"].indexOf(this.props.control_buttons) != -1 && <Controller multi={1 < this.props.items.length} target={this.props.target} prev={()=>this._carousel._animatePreviousPage()} next={()=>this._carousel._animateNextPage()}/>}
function Controller({
  slides_control,
  play_control,
  prev,
  next,
  target,
}){
  const {params:{ id }={}} = route = useRoute();
  let content, wrap;
  switch(play_control){
    case "button":
      content= <PlayPause/>;
      break;
    case "rotate":
      content = <SpriteCube target={target}/>;
      break;
    case "none":
    default:
      content = null;
  }
  if((prev || next) && ["default", "buttons"].indexOf(slides_control) !== -1){
    wrap = (<PrevNext prev={prev} next={next}>{content}</PrevNext>);
  }else{
    wrap = content;
  }
  return <View style={styles.view} pointerEvents="box-none">{wrap}</View>;
}

Controller.propTypes = {
  prev: PropTypes.func,
  next: PropTypes.func,
}

const styles = StyleSheet.create({
  view: {
    flex: 0,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent:'center',
    position: "absolute",
    alignSelf: 'center',
  },
})

export const ConnectedController = connect((state)=>({
  slides_control: state.conf.slides_control,
  play_control: state.conf.play_control,
  target: getActiveProduct(state),
}))(Controller);