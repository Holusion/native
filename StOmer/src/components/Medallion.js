import React from 'react'
import {View, Image} from 'react-native'
import PropTypes from 'prop-types'
import {connectStyle} from 'native-base'
import * as Config from '../../Config'

function Medallion(props) {
    const styles = props.style;
    return (
        <View style={styles.container}>
            <Image source={{uri: `${props.imageUri}`, scale: 1}} style={styles.image}/>
        </View>
    )
}

const styles = {
    container: {
        borderWidth: 3,
        borderColor: Config.primaryColor,
        padding: 8,
        width: 116,
        height: 116,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        width:100, 
        height:100,
        resizeMode: 'contain', 
        alignSelf: "center"
    }
}

Medallion.propTypes = {
    imageUri: PropTypes.string,
}

export default connectStyle('holusion.Medallion', styles)(Medallion);