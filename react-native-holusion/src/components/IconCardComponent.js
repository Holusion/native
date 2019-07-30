import React from 'react';
import { StyleSheet, View, Image } from "react-native";
import { connectStyle } from 'native-base'

import Markdown from 'react-native-markdown-renderer'

function IconCardComponent(props) {
  const styles = props.style;
  return (
      <View style={styles.container}>
          <Image style={styles.icon} source={props.source}/>
          <View style={styles.titleContainer}>
              <Markdown style={markdownTitle}>{props.title}</Markdown>
          </View>
      </View>
  );
}

const styles = {
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
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
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
      fontSize: 26,
      alignSelf: 'center'
    }
}

const markdownTitle = StyleSheet.create({
    text: styles.titleText
})

export default connectStyle('holusion.IconCardComponent', styles)(IconCardComponent);
