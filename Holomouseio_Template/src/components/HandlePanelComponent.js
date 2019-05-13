import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import RetryButtonComponent from './RetryButtonComponent';

import * as Config from '../../Config'
import * as strings from '../../strings.json'

export default class HandlePanelComponent extends React.Component {

    render() {
        let retryButton = null;
        if((this.props.task.type == "warn" || this.props.task.type == "danger") && this.props.task.retry) {
            retryButton = <RetryButtonComponent type={this.props.task.type} onPress={this.props.task.retry.bind(this)}/>
        } else if(this.props.task.type == "info") {
            retryButton = <ActivityIndicator />
        }

        let title = '';
        switch(this.props.task.type) {
            case "warn": title = strings.warn; break;
            case "danger": title = strings.danger; break;
            case "info": title = strings.info; break;
            case "success": title = strings.success; break;
        }
        
        return (
        <View style={styles.main}>
            <View style={styles[`title_${this.props.task.type}`]}>
                <Text style={{color: "#fff", fontSize: 18, padding: 8}}>{title}</Text>
            </View>
            <View style={styles[this.props.task.type]}>
                <View style={{width: "80%", alignContent: 'center', alignContent: 'center'}}>
                    <Text style={styles[`text_${this.props.task.type}`]}>{this.props.taskName + " : " + this.props.task.message}</Text>
                </View>
                <View style={{width: "20%", alignContent: 'center', alignContent: 'center'}}>
                    {retryButton}
                </View>
            </View>
        </View>
        )
        
    }
}

const styles = StyleSheet.create({
    main: {
        width: "75%",
        marginTop: 8
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