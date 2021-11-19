'use strict';
import React from 'react';
import {connectStyle, View, Icon} from "native-base";
import { StyleSheet, TouchableOpacity } from "react-native"
import PropTypes from "prop-types";



class PrevNext extends React.Component{
    static propTypes = {
        children: PropTypes.node,
        target: PropTypes.object,
        next: PropTypes.func,
        prev: PropTypes.func,
    }

    render(){
        return (<View style={this.props.style.view} pointerEvents="box-none">
            <View style={{opacity: this.props.prev? 1 : 0}} pointerEvents={this.props.prev?"auto":"none"}>
                <TouchableOpacity key="prev" testID="button-prev" style={this.props.style.controlPrev} disabled={!this.props.prev} onPress={this.props.prev}>
                    <Icon primary large style={this.props.style.controlIcons} type="Ionicons" name="chevron-back"/>
                </TouchableOpacity>
            </View>
            {this.props.children}
            <View style={{opacity: this.props.next? 1 : 0, zIndex:this.props.next? 1:-1}} pointerEvents={this.props.next?"auto":"none"}>
                <TouchableOpacity key="next" testID="button-next" style={this.props.style.controlNext} disabled={!this.props.next} onPress={this.props.next}>
                    <Icon primary large style={this.props.style.controlIcons} type="Ionicons" name="chevron-forward"/>
                </TouchableOpacity>
            </View>
        </View>)
    }
}

const prevNextTheme = {
    view: {
        flex: 0,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent:'center',
        alignSelf: 'center',
        zIndex: -1
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
}

export default connectStyle('Holusion.PrevNext', prevNextTheme)(PrevNext);