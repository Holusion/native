
import React from "react";
import PropTypes from "prop-types";
import {View} from "react-native";
import {BaseView, WikiView} from "../../components";

export default class ObjectView extends React.PureComponent {
  static propTypes = {
    item: PropTypes.object.isRequired,
    views: PropTypes.object,
  }
  static defaultProps = {
    views: {
      Base: BaseView,
      Wiki: WikiView,
    }
  }
  render(){
      let layout = this.props.item.layout || "Base";
      let View_component = this.props.views[layout];
      if(!View_component){
          console.warn(`No view provided for layout ${layout}`);
          View_component = this.props.views["Base"];
      }
      return (<View style={{width:this.props.width}}>
        <View_component active={true} {...this.props.item} />
      </View>)
  }
}