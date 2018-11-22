import React from 'react';
import { StyleSheet, View, Image, Text } from "react-native";

export default class IconCard extends React.Component {
    render() {
        return (
            <View style={{...styles.container, ...this.props.style}}>
                <Image style={{alignSelf: 'center', width: this.props.style.width * 0.6 || 0, height: this.props.style.height * 0.6 || 0, marginTop: 16}} source={this.props.source}/>
                <View style={styles.title}>
                    <Text style={{color: 'white', fontSize: this.props.style.titleSize || 26, textAlign: this.props.style.titleAlign || 'center'}}>{this.props.content}</Text>
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
        margin: 20,
        padding: 8,
        borderRadius: 8
    },

    title: {
        marginLeft: 16,
        marginRight: 16,
        marginTop: 10,
    }
})