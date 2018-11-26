import React from 'react';
import { StyleSheet, View, Image, Text } from "react-native";
import { connectStyle } from 'native-base'

export class IconCard extends React.Component {
  render() {
    const styles = this.props.style
    return (
        <View style={styles.container}>
            <Image style={styles.icon} source={this.props.source}/>
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>{this.props.content}</Text>
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
        height: 200,
        backgroundColor: "#0092dbff"
    },

    titleContainer: {
        marginLeft: 16,
        marginRight: 16,
        marginTop: 10,
    },

    icon: {
      alignSelf: 'center', 
      width: 120, 
      height: 120, 
      marginTop: 16
    },

    titleText: {
      color: 'white',
      textAlign: 'center',
      fontSize: 26
    }
})

export default connectStyle('holusion.IconCard', styles)(IconCard);
