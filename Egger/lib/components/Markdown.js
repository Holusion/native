import React from "react";
import {StyleSheet} from 'react-native';
import Renderer from 'react-native-markdown-renderer'
import {theme} from "../../theme";

export default function Markdown(props){
    return <Renderer style={styles}>{props.children}</Renderer>
}

const styles = StyleSheet.create({
    text: {
        fontSize: 18
    },
    heading1:{
        fontFamily: theme.fontFamilyH1,
        color: theme.brandPrimary,
        fontSize: 28,
    },
    heading2:{
        fontFamily: theme.fontFamilyH2,
        color: theme.brandSecondary,
        fontSize: 24,
    }
});