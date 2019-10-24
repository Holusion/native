import React from "react";
import {StyleSheet} from 'react-native';
import {connectStyle} from "native-base";
import Renderer from 'react-native-markdown-renderer'

function Markdown(props){
    return <Renderer style={props.style}>{props.children}</Renderer>
}

const mdTheme = StyleSheet.create({
    text: {
        fontSize: 18
    },
    heading1:{
        fontSize: 28,
    },
    heading2:{
        fontSize: 24,
    }
});



export default connectStyle('Holusion.Markdown', mdTheme)(Markdown);
