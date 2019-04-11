import React from 'react';

import { Content } from 'native-base';
import { View, Text, ActivityIndicator, Dimensions } from 'react-native';
import * as Config from '../../utils/Config'

/**
 * This view appears when application search a product or if it downloads the files from firebase
 */
export default class SearchScreenComponent extends React.Component {

    render() {
        return (
            <Content>
                <View style={{flex: 1, justifyContent: 'center', height: screenHeight}}>
                    <ActivityIndicator size="large" />
                    <Text style={{textAlign: 'center', color: Config.primaryColor, fontSize: 32}}>{this.props.content}</Text>
                </View>
            </Content>
        )
    }
}

const {height: screenHeight} = Dimensions.get("window");