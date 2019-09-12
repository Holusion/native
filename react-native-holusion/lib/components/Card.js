import React from 'react';
import { StyleSheet, View, Image} from "react-native";
import { connectStyle, Text } from 'native-base'

function Card(props) {
  const styles = props.style;
  return (
      <View style={styles.container}>
          <Image key={props.source.uri} style={styles.icon} source={props.source} resizeMode="cover"/>
          <View style={styles.titleContainer}>
              <Text ellipsizeMode="tail" numberOfLines={1} style={styles.titleText}>{props.title}</Text>
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
        padding: 0,
        borderRadius: 8,
        backgroundColor: "transparent",
        borderColor:"#0092dbff",
        borderWidth: 1,
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
      width: 200, 
      height: 200, 
    },

    titleText: {
      color:"#0092dbff",
      width: 200,
      textAlign: 'center',
      fontSize: 26,
      alignSelf: 'center'
    }
}

const markdownTitle = StyleSheet.create({
    text: styles.titleText
})

export default connectStyle('holusion.IconCardComponent', styles)(Card);
