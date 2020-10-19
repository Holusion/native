'use strict';
import React from 'react';
import {connectStyle, View, Icon} from "native-base";
import { StyleSheet, TouchableOpacity } from "react-native"
import PropTypes from "prop-types";



class PrevNext extends React.Component{
    static propTypes = {
        children: PropTypes.node,
        target: PropTypes.object,
        next: PropTypes.func.isRequired,
        prev: PropTypes.func.isRequired,
    }

    render(){
        return (<View style={this.props.style.view}>
            <TouchableOpacity key="prev" testID="button-prev" style={this.props.style.controlPrev} onPress={this.props.prev}>
                <Icon primary large style={this.props.style.controlIcons} type="Ionicons" name="ios-caret-back"/>
            </TouchableOpacity>
            {this.props.children}
            <TouchableOpacity key="next" testID="button-next" style={this.props.style.controlNext} onPress={this.props.next}>
                <Icon primary large style={this.props.style.controlIcons} type="Ionicons" name="ios-caret-forward"/>
            </TouchableOpacity>
        </View>)
    }
}

const prevNextTheme = StyleSheet.create({
    view: {
        flex: 0,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent:'center',
        alignSelf: 'center',
    },
    controlPrev: {
        paddingLeft: 10,
    },
    controlNext: {
        paddingRight: 10,
    },
    controlIcons:{
        fontSize: 60,
        height: 60,
        lineHeight: 60,
        padding: 5,
        fontWeight: "bold"
    },
})

export default connectStyle('Holusion.PrevNext', prevNextTheme)(PrevNext);