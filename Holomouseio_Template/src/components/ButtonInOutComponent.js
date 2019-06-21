import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import * as Config from '../../Config'

export default class ButtonInOutComponent extends React.Component {
    render() {
        return <TouchableOpacity ref="innerView" onPress={this.onPress} style={styles.container}>
            <Icon name={this.props.predicate ? this.props.iconIn : this.props.iconOut} style={styles.icon} />
        </TouchableOpacity>
    }

    onPress() {
        this.props.predicate ? this.props.onPressIn() : this.props.onPressOut();
    }

    constructor(props) {
        super(props);
        this.onPress = this.onPress.bind(this);
    }
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center'
    },
    icon: {
        fontSize: 75, 
        color: Config.primaryColor
    }
})