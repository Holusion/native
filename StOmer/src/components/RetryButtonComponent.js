import React from "react";

import {Button} from 'native-base'
import {StyleSheet, Text} from 'react-native'

import * as Config from '../../Config'

export default function RetryButtonComponent(props) {
    return (
        <Button style={styles[`button_${props.type}`]} onPress={props.onPress}>
            <Text style={styles[`textButton_${props.type}`]}>Réessayer</Text>
        </Button>
    )
}

const styles = StyleSheet.create({
    button_danger: {
        backgroundColor: Config.dangerButton, 
        margin: 8, 
        alignSelf: 'center', 
        width: "90%",
        padding: 8,
        justifyContent: 'center',
        borderColor: Config.dangerText,
        borderWidth: 1
    },
    textButton_danger: {
        fontSize: 18, 
        fontWeight: 'bold',
        color: Config.dangerText
    },
    button_warn: {
        backgroundColor: Config.warnButton, 
        margin: 8, 
        alignSelf: 'center', 
        width: '90%',
        padding: 8,
        justifyContent: 'center',
        borderColor: Config.warnText,
        borderWidth: 1
    },
    textButton_warn: {
        fontSize: 18, 
        fontWeight: 'bold',
        color: Config.warnText
    },
    button_info: {
        backgroundColor: Config.infoButton, 
        margin: 8, 
        alignSelf: 'center', 
        width: '90%',
        padding: 8,
        justifyContent: 'center',
        borderColor: Config.infoText,
        borderWidth: 1
    },
    textButton_info: {
        fontSize: 18, 
        fontWeight: 'bold',
        color: Config.infoText
    },
    button_success: {
        backgroundColor: Config.successButton, 
        margin: 8, 
        alignSelf: 'center', 
        width: '90%',
        padding: 8,
        justifyContent: 'center',
        borderColor: Config.successText,
        borderWidth: 1
    },
    textButton_success: {
        fontSize: 18, 
        fontWeight: 'bold',
        color: Config.successText
    },
})