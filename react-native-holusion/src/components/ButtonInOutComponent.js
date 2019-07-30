import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {connectStyle, StyleProvider} from 'native-base'

import * as Config from '../../Config'

class ButtonInOutComponent extends React.Component {
    render() {
        const styles = this.props.style;
        return ( 
        <TouchableOpacity ref="innerView" onPress={this.onPress} style={styles.container}>
            <Icon name={this.props.predicate ? this.props.iconIn : this.props.iconOut} style={styles.icon} />
        </TouchableOpacity>
        )
    }

    onPress() {
        this.props.predicate ? this.props.onPressIn() : this.props.onPressOut();
    }

    constructor(props) {
        super(props);
        this.onPress = this.onPress.bind(this);
    }
}

const styles = {
    container: {
        alignSelf: 'center'
    },
    icon: {
        fontSize: 75, 
        color: Config.primaryColor
    }
}

export default connectStyle('holusion.ButtonInOutComponent', styles)(ButtonInOutComponent)