import React, {useContext} from "react";
import {StyleSheet} from 'react-native';

import ObjectLink from "./ObjectLink";

import Renderer, { MarkdownIt } from 'react-native-markdown-display';

import { ThemeContext } from "./style";

const BAD_PROTO_RE = /^(vbscript|javascript|data):/;
const GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;

function useTheme(){
  const theme = useContext(ThemeContext);
  return {mdTheme: {
    heading1:{
      fontSize: theme.fontSize.h1,
      //fontFamily: theme.fontFamily.h2,
      color: theme.colors.primary,
    },
    heading2:{
      fontSize: theme.fontSize.h2,
      //fontFamily: theme.fontFamily.h2,
      color: theme.colors.secondary,
    },
    text: {
      fontSize: theme.fontSize.default,
    },
  }}
}

export default function Markdown(props){
  const mdTheme = useTheme();
  const parser = MarkdownIt({
    typographer: true,
    validateLink: (url)=> {
      str = url.trim().toLowerCase();
      return BAD_PROTO_RE.test(str) ? (GOOD_DATA_RE.test(str) ? true : false) : true;
    }
  });

  const rules = {
    link: (node, children, parent, styles) => (
      <ObjectLink to={node.attributes.href}
        key={node.key}
        style={styles.link}>
        {children}
      </ObjectLink>
    ),
    blocklink: (node, children, parent, styles) => (
      <ObjectLink to={node.attributes.href}
        key={node.key}
        style={styles.blocklink}>
        <View style={styles.image}>{children}</View>
      </ObjectLink>
    ),
  }

  const styles = Array.isArray(props.style)? props.style.reduce((acc, v)=>{return {...acc, ...v}}, {}): props.style;
  return <Renderer 
    rules={rules}
    markdownit={parser}
    allowedImageHandlers={["file://", 'data:image/png;base64', 'data:image/gif;base64', 'data:image/jpeg;base64', "http://", "https://"]} 
    defaultImageHandler={null}
    style={mdTheme}
  >
    {props.children}
  </Renderer>
  
}



//export default connectStyle('Holusion.Markdown', mdTheme)(Markdown);
