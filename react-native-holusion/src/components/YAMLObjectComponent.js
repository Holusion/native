'use strict'

import React from 'react';
import { View } from 'react-native';
import Markdown from 'react-native-markdown-renderer'

/**
 * This component give the renderer for parsed yaml file
 */
export default function YAMLObjectComponent(props) {
    let texte = "";
    if(props.data) {
        if(props.data.error) {
            texte = props.data.error;
        } else {
            texte = props.data['Texte principal'];
        }
    }
    
    return(
        <View>
            <Markdown style={props.style}>{texte}</Markdown>
        </View>
    )
}