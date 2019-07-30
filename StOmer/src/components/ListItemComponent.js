import React from 'react';
import { StyleSheet, View, TouchableOpacity } from "react-native";

export default function ListItemComponent(props) {
    const childrenArray = React.Children.map(
        props.children,
        child => child
    );

    return (
        <TouchableOpacity onPress={props.onPress}>
            <View style={[props.style, styles.container]}>
                {childrenArray}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
    }
})