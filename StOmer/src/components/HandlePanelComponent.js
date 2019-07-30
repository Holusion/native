import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import RetryButtonComponent from './RetryButtonComponent';

import * as Config from '../../Config'
import * as strings from '../../strings.json'

export default function HandlePanelComponent(props) {
    let retryButton = null;
    if((props.task.type == "warn" || props.task.type == "danger") && props.task.retry) {
        retryButton = <RetryButtonComponent type={props.task.type} onPress={props.task.retry.bind(this)}/>
    } else if(props.task.type == "info") {
        retryButton = <ActivityIndicator />
    }
    
    let title = '';
    switch(props.task.type) {
        case "warn": title = strings.warn; break;
        case "danger": title = strings.danger; break;
        case "info": title = strings.info; break;
        case "success": title = strings.success; break;
    }
    
    return (
    <View style={styles.main}>
        <View style={styles[`title_${props.task.type}`]}>
            <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles[props.task.type]}>
            <View style={styles.messageContainer}>
                <Text style={styles[`text_${props.task.type}`]}>{props.taskName + " : " + props.task.message}</Text>
            </View>
            <View style={styles.buttonContainer}>
                {retryButton}
            </View>
        </View>
    </View>
    )
}

const styles = StyleSheet.create({
    main: {
        width: "100%",
        marginTop: 8
    },
    title: {
        color: "#fff", 
        fontSize: 18, 
        padding: 8
    },
    messageContainer: {
        width: "80%", 
        alignContent: 'center', 
        alignContent: 'center'
    },
    buttonContainer: {
        width: "20%", 
        alignContent: 'center', 
        alignContent: 'center'
    },
    danger: {
        display: 'flex',
        backgroundColor: Config.dangerBackground,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        borderBottomColor: Config.dangerText, 
        borderBottomWidth: 1
    },
    title_danger: {
        backgroundColor: Config.dangerText
    },
    text_danger: {
        padding: 8, 
        color: Config.dangerText, 
        fontSize: 18
    },
    warn: {
        display: 'flex',
        backgroundColor: Config.warnBackground,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        borderBottomColor: Config.warnText, 
        borderBottomWidth: 1
    },
    title_warn: {
        backgroundColor: Config.warnText
    },
    text_warn: {
        padding: 8, 
        color: Config.warnText, 
        fontSize: 18
    },
    info: {
        display: 'flex',
        backgroundColor: Config.infoBackground,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        borderBottomColor: Config.infoText, 
        borderBottomWidth: 1
    },
    title_info: {
        backgroundColor: Config.infoText
    },
    text_info: {
        padding: 8, 
        color: Config.infoText, 
        fontSize: 18
    },
    success: {
        display: 'flex',
        backgroundColor: Config.successBackground,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        borderBottomColor: Config.successText, 
        borderBottomWidth: 1
    },
    title_success: {
        backgroundColor: Config.successText
    },
    text_success: {
        padding: 8, 
        color: Config.successText, 
        fontSize: 18
    }
})