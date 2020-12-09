import React from "react";
import {StyleSheet} from 'react-native';
import {connectStyle} from "native-base";
import {Link} from "@react-navigation/native";

import Renderer, { MarkdownIt } from 'react-native-markdown-display'

const BAD_PROTO_RE = /^(vbscript|javascript|data):/;
const GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;


class Markdown extends React.Component {
  constructor(props){
      super(props);
      this.parser = MarkdownIt({typographer: true});
      this.parser.validateLink = (url)=> {
        str = url.trim().toLowerCase();
        return BAD_PROTO_RE.test(str) ? (GOOD_DATA_RE.test(str) ? true : false) : true;
      };
  }
  static handlers = ["file://", 'data:image/png;base64', 'data:image/gif;base64', 'data:image/jpeg;base64', "http://", "https://"]
  rules = {
    link: (node, children, parent, styles) => (
      <Link to={`/${node.attributes.href}`}
        key={node.key}
        style={styles.link}>
        {children}
      </Link>
    ),
    blocklink: (node, children, parent, styles) => (
      <Link to={`/${node.attributes.href}`}
        key={node.key}
        style={styles.blocklink}>
        <View style={styles.image}>{children}</View>
      </Link>
    ),
  }

  render(){
    //console.log("Render markdown : ", this.props.children);
    const styles = Array.isArray(this.props.style)? this.props.style.reduce((acc, v)=>{return {...acc, ...v}}, {}): this.props.style;
    return <Renderer 
      rules={this.rules}
      markdownit={this.parser}
      allowedImageHandlers={["file://", 'data:image/png;base64', 'data:image/gif;base64', 'data:image/jpeg;base64', "http://", "https://"]} 
      defaultImageHandler={null}
      style={styles}
    >
      {this.props.children}
    </Renderer>
  }
}

const mdTheme = StyleSheet.create({

});



export default connectStyle('Holusion.Markdown', mdTheme)(Markdown);
