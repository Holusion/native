import React from 'react';

import { Content } from 'native-base';
import { View, Text, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import * as Config from '../../../Config'

/**
 * This view appears when application search a product or if it downloads the files from firebase
 */
export default class SearchScreenComponent extends React.Component {

    render() {
        return (
            <Content>
                <View style={styles.container}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.text}>{this.props.content}</Text>
                </View>
            </Content>
        )
    }
}

const {height: screenHeight} = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: 'center', 
        height: screenHeight
    },
    text: {
        textAlign: 'center', 
        color: Config.primaryColor, 
        fontSize: 32
    }
})