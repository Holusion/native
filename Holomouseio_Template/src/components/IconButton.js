import React from 'react';

import {StyleSheet, TouchableOpacity} from 'react-native';
import { Icon } from 'native-base';

import * as Config from '../../Config'

export default class IconButton extends React.Component {
    constructor(context, props) {
        super(context, props)
    }

    render() {
        return (
            <TouchableOpacity style={Object.assign({}, styles.button, this.props.style)} onPress={this.props.onPress}>
                <Icon type={this.props.type} style={styles.icon} name={this.props.name} />
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    button: {
        width: 75,
        height: 75,
        borderRadius: 75 / 2,
        backgroundColor: 'rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Config.primaryColor,
        shadowColor: "#000", 
        shadowOffset: {
            width: 1, 
            height: 2
        }, 
        shadowOpacity: 0.4, 
        shadowRadius: 5,
    },
    icon: {
        fontSize: 75 / 2,
        color: "white"
    }
})