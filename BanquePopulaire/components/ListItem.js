import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from "react-native";

export default class ListItem extends React.Component {
    renderChildren() {
        const childrenArray = React.Children.map(
            this.props.children,
            child => child
        );

        return childrenArray;
    }

    render() {
        return (
            <TouchableOpacity onPress={this.props.onPress}>
                <View style={[this.props.style, styles.container]}>
                    {this.renderChildren()}
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
    }
})