import React from "react";
import {StyleSheet} from 'react-native';
import {connectStyle} from "native-base";
import Renderer from 'react-native-markdown-renderer'

function Markdown(props){
    const styles = Array.isArray(props.style)? props.style.reduce((acc, v)=>{return {...acc, ...v}}, {}): props.style;
    return <Renderer style={styles}>{props.children}</Renderer>
}

const mdTheme = StyleSheet.create({
});



export default connectStyle('Holusion.Markdown', mdTheme)(Markdown);
