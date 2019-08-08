import React from 'react';

import { IconCardComponent } from '@holusion/react-native-holusion'
import { StyleSheet, View, TouchableOpacity, Text, Animated } from 'react-native';
import * as Config from '../../../Config'

import resources from '../../../resources'
import * as strings from '../../../strings'

/**
 * Default view, when all file download or product found
 */
export default class DefaultHomeScreenComponent extends React.Component {
    componentDidMount() {
        this.spring();
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Animated.Text style={{...styles.catchphrase, transform: [{scale: this.springValue}]}}>{strings.home.catchphrase}</Animated.Text>
                </View>
                <View style= {styles.cardContainer}>
                    <TouchableOpacity onPress={this.props.catalogue}>
                        <IconCardComponent source={resources.rightCardIcon} title={strings.home.rightCardTitle} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={this.props.remerciement} style={styles.footerContainer}>
                    <View>
                        <Text style={styles.footerButton}>{strings.home.footerButton}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    spring() {
        this.springValue.setValue(0.95);
        Animated.loop(

            Animated.spring(this.springValue, {
                toValue: 1,
                friction: 2,
            })
        ).start()
    }

    constructor(props, context) {
        super(props, context);
        this.springValue = new Animated.Value(0.95);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex', 
        flexDirection: "column", 
        alignItems: 'center'
    },
    images: {
        width: 200,
        height: 100,
        resizeMode: 'contain',
        alignSelf: 'flex-end',
        marginRight: 16
    },
    catchphrase: {
        color: Config.primaryColor,
        fontSize: 48,
        textAlign: 'center'
    },
    titleContainer: {
        flex: 1,
        display: "flex",
        justifyContent: 'center',
        alignItems: 'center'

    },
    cardContainer: {
        flex: 2,
        display: 'flex', 
        flexDirection: "row", 
        alignContent: 'center', 
        justifyContent: 'center'
    },
    footerContainer: {
        display: 'flex', 
        justifyContent: 'center', 
        flexDirection: 'row', 
        backgroundColor: Config.primaryColor, 
        borderRadius: 8, 
        padding: 8, 
        shadowOffset: {
            width: 0, 
            height: 10
        }, 
        shadowOpacity: 0.8, 
        shadowRadius: 10,
        width: "90%",
        position: "absolute",
        bottom: 32
    },
    footerButton: {
        color: 'white', 
        fontSize: 28
    }
});