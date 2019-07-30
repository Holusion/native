import React from 'react';

import {TouchableOpacity} from 'react-native';
import { Icon, connectStyle } from 'native-base';

import * as Config from '../../Config'

function IconButton(props) {
    const styles = props.style;
    
    return (
        <TouchableOpacity style={styles.button} onPress={props.onPress}>
            <Icon type={props.type} style={styles.icon} name={props.name} />
        </TouchableOpacity>
    )
}

const styles = {
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
}

export default connectStyle('holusion.IconButton', styles)(IconButton);