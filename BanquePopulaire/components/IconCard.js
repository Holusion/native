import React from 'react';
import { StyleSheet, View, Image, Text } from "react-native";

export default class IconCard extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.icon} source={this.props.source}/>
                <View style={styles.title}>
                    <Text style={{color: 'white', fontSize: 26, textAlign: 'center'}}>{this.props.content}</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: "#094fa3ff",
        width: 300,
        height: 300,
        margin: 20,
        padding: 0,
    },

    icon: {
        width: 180,
        height: 180,
        alignSelf: 'center',
    },

    title: {
        backgroundColor: '#0000002b',
        marginLeft: 16,
        marginRight: 16,
        marginTop: 16,
        padding: 25,
    }
})