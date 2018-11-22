import React from 'react';
import { StyleSheet, View, Image, Text } from "react-native";

export default class IconCard extends React.Component {
  render() {
    let imageStyle = {};
    let textStyle = {};
    let style = {...styles.container, ...this.props.style} || styles.container;

    if(this.props.source) {
      imageStyle = {alignSelf: 'center', width: style.width * 0.6 || 0, height: style.height * 0.6 || 0, marginTop: 16};
    } else {
      imageStyle = {alignSelf: 'center', width: 0, height: 0, marginTop: 16};
    }

    if(this.props.style) {
      textStyle = {color: 'white', fontSize: style.titleSize || 26, textAlign: style.titleAlign || 'center'};
    } else {
      textStyle = {color: 'white', fontSize: 26, textAlign: 'center'};
    }

    return (
        <View style={{...styles.container, ...this.props.style}}>
            <Image style={imageStyle} source={this.props.source}/>
            <View style={styles.title}>
                <Text style={textStyle}>{this.props.content}</Text>
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
        borderRadius: 8,
        width: 200,
        height: 200
    },

    title: {
        marginLeft: 16,
        marginRight: 16,
        marginTop: 10,
    }
})
