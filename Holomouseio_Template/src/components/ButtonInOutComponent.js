import React from 'react'
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import * as Config from '../../Config'

export default class ButtonInOutComponent extends React.Component {
    render() {
        return <TouchableOpacity ref="innerView" onPress={this.onPress} style={{alignSelf: 'center'}}>
            <Icon name={this.state.in ? this.props.iconIn : this.props.iconOut} style={{fontSize: 75, color: Config.primaryColor}} />
        </TouchableOpacity>
    }

    onPress() {
        this.setState((prevState) => ({ in: !prevState.in }));
        this.state.in ? this.props.onPressIn() : this.props.onPressOut();
    }

    constructor(props) {
        super(props);
        this.state = {
            in: true
        }
        this.onPress = this.onPress.bind(this);
    }
}