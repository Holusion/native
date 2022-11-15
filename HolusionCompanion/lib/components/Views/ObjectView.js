
import React, {memo} from "react";
import PropTypes from "prop-types";
import {View} from "react-native";
import {BaseView, WikiView} from "..";
import { useDuration } from "../../sync/hooks";


function ObjectView({item, width="100%", views={Base: BaseView, Wiki: WikiView}}){
  useDuration(item.duration);
  let layout = item.layout || "Base";
  let View_component = views[layout];
  if(!View_component){
      console.warn(`No view provided for layout ${layout}`);
      View_component = views["Base"];
  }
  return (<View style={{width:width, flex: 1}}>
    <View_component active={true} {...item} />
  </View>)
}
ObjectView.propTypes = {
  item: PropTypes.object.isRequired,
  views: PropTypes.object,
}

export default memo(ObjectView);