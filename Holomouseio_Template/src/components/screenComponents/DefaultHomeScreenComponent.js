import React from 'react';

import { Content } from 'native-base';
import IconCardComponent from '../../components/IconCardComponent'
import { StyleSheet, View, TouchableOpacity, Image, Text, Animated } from 'react-native';
import * as Config from '../../utils/Config'

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
            <Content>
                <View>
                    <Image style={styles.images} source={resources.topRightLogo} />
                    <Animated.Text style={{...styles.catchphrase, transform: [{scale: this.springValue}]}}>{strings.home.catchphrase}</Animated.Text>
                    <View style= {{display: 'flex', flex: 1, flexDirection: "row", alignContent: 'center', justifyContent: 'center'}}>
                        <TouchableOpacity onPress={this.props.visite}>
                            <IconCardComponent source={resources.leftCardIcon} title={strings.home.leftCardTitle} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.props.catalogue}>
                            <IconCardComponent source={resources.rightCardIcon} title={strings.home.rightCardTitle} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={this.props.remerciement}>
                        <View style={{display: 'flex', justifyContent: 'center', flexDirection: 'row', margin: 24, backgroundColor: Config.primaryColor, borderRadius: 8, padding: 8, shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.8, shadowRadius: 10}}>
                            <Text style={{color: 'white', fontSize: 28}}>{strings.home.footerButton}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Content>
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
    images: {
        flex: 1,
        width: 200,
        height: 100,
        resizeMode: 'contain',
        alignSelf: 'flex-end',
        marginRight: 16
    },
    catchphrase: {
        color: Config.primaryColor,
        fontSize: 48,
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 50
    }
});