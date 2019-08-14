import React from 'react'
import {View, Image, StyleSheet} from 'react-native'
import PropTypes from 'prop-types'
import {connectStyle} from 'native-base'
import * as Config from '../../Config'
import Markdown from 'react-native-markdown-renderer';

function Medallion(props) {
    const styles = props.style;
    const txt = props.references.map(ref => <Markdown style={markdownText}>**{ref}** : {props.obj[ref]}</Markdown>)

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={{uri: `${props.imageUri}`}} style={styles.image}/>
            </View>
            <View style={styles.textContainer}>
                {txt}
            </View>
        </View>
    )
}

const styles = {
    container: {
        borderWidth: 3,
        borderColor: Config.primaryColor,
        padding: 8,
    },
    image: {
        width: 150,
        height: 150,
        resizeMode: 'contain', 
    },
    imageContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center"
    }
}

markdownText = StyleSheet.create({
    text: {
        color: Config.textColor,
        fontSize: 24
    }
})

Medallion.propTypes = {
    imageUri: PropTypes.string,
}

export default connectStyle('holusion.Medallion', styles)(Medallion);