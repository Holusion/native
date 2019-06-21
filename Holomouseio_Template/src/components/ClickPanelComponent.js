import React from 'react'
import { StyleSheet, Text } from 'react-native';
import { Col } from "native-base";
import Icon from "react-native-vector-icons/Ionicons"

import * as Config from '../../Config'

export default class ClickPanelComponent extends React.Component {

    render() {
        return <Col style={styles.panel} onPress={this.props.onPress}>
            <Icon name={this.props.icon} style={styles.icon}/>
            <Text style={styles.content}>{this.props.content}</Text>
        </Col>
    }
}

const styles = StyleSheet.create({
    panel: {
        backgroundColor: '#ecececff',
        width: 150,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        fontSize: 100,
        color: Config.primaryColor
    },
    content: {
        color: Config.secondaryColor,
        fontSize: 16
    }, 
})