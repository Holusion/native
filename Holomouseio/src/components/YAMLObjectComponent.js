'use strict'

import React from 'react';
import { View, Text } from 'react-native';
import Markdown from 'react-native-markdown-renderer'

export default class YAMLObjectComponent extends React.Component {

    render() {
        let texte = "";
        if(this.props.data) {
            texte = this.props.data['Texte principal'];
        }

        return(
            <View>
                <Markdown style={this.props.style}>{texte}</Markdown>
            </View>
        )
    }

    constructor(props, context) {
        super(props, context);
    }
}