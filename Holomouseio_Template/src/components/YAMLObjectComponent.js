'use strict'

import React from 'react';
import { View, Text } from 'react-native';
import Markdown from 'react-native-markdown-renderer'

/**
 * This component give the renderer for parsed yaml file
 */
export default class YAMLObjectComponent extends React.Component {

    render() {
        let texte = "";
        if(this.props.data) {
            if(this.props.data.error) {
                texte = this.props.data.error;
                pushError("Les informations sur l'objet sont mal formaté")
            } else {
                texte = this.props.data['Texte principal'];
            }
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