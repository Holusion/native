'use strict';
import React from 'react';
import {connectStyle, View, Button, Icon} from "native-base";
import { StyleSheet } from "react-native"
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
            <Button key="prev" testID="button-prev" transparent large style={this.props.style.controlButton} onPressIn={()=>this.props.prev()}>
                <Icon primary large style={this.props.style.controlIcons} ios="ios-caret-back"/>
            </Button>
            {this.props.children}
            <Button key="next" testID="button-next" transparent large style={this.props.style.controlButton} onPressIn={()=>this.props.next()}>
                <Icon primary large style={this.props.style.controlIcons} ios="ios-caret-forward"/>
            </Button>
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
    controlButton:{
        paddingVertical: 5,
        paddingHorizontal: 5, 
    },
    controlIcons:{
        fontSize: 60,
        height: 60,
        lineHeight: 60,
        fontWeight: "bold"
    },
})

export default connectStyle('Holusion.PrevNext', prevNextTheme)(PrevNext);