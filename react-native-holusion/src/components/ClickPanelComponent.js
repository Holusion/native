import React from 'react'
import { Text } from 'react-native';
import { Col, connectStyle } from "native-base";
import Icon from "react-native-vector-icons/Ionicons"

import * as Config from '../../Config'

function ClickPanelComponent(props) {
    const styles = props.style;

    return <Col style={styles.panel} onPress={props.onPress}>
        <Icon name={props.icon} style={styles.icon}/>
        <Text style={styles.content}>{props.content}</Text>
    </Col>
}

const styles = {
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
}

export default connectStyle('holusion.ClickPanelComponent', styles)(ClickPanelComponent)