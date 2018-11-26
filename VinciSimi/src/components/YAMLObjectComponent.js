'use strict'

import React from 'react';
import { View, Text } from 'react-native';

export default class YAMLObjectComponent extends React.Component {

    render() {
        let texte = "";
        if(this.props.data) {
            texte = this.props.data['Texte principal'];
        }

        return(
            <View>
                <Text style={this.props.style}>{texte}</Text>
            </View>
        )
    }

    constructor(props, context) {
        super(props, context);
    }
}