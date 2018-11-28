import React from 'react';

import { Content, Container, StyleProvider } from 'native-base';
import { StyleSheet, View, TouchableOpacity, Image, Text, ActivityIndicator, Dimensions, Animated } from 'react-native';
import {network, IconCard, assetManager} from '@holusion/react-native-holusion'

import * as zeroconfManager from "../utils/zeroconfManager";
import * as networkExtension from '../utils/networkExtention';

class DefaultComponent extends React.Component {
    componentDidMount() {
        this.spring();
    }

    render() {
        return (
            <Content>
                <Image style={styles.images} source={require("../../assets/images/logo.png")} />
                <Animated.Text style={{...styles.catchphrase, transform: [{scale: this.springValue}]}}>Bienvenue, touchez une carte</Animated.Text>
                <View style= {{display: 'flex', flex: 1, flexDirection: "row", alignContent: 'center', justifyContent: 'center'}}>
                    <TouchableOpacity onPress={this.props.catalogue}>
                        <IconCard source={require("../../assets/icons/catalogue.png")} content="Catalogue"/>
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

class SearchProductComponent extends React.Component {
    render() {
        return (
            <Content>
                <View style={{flex: 1, justifyContent: 'center', height: screenHeight}}>
                    <ActivityIndicator size="large" />
                    <Text style={{textAlign: 'center', color: "#ae2573ff", fontSize: 32}}>Recherche du produit...</Text>
                </View>
            </Content>
        )
    }
}

export default class HomeScreen extends React.Component {

    render() {
        let display = this.state.url ? <DefaultComponent url={this.state.url} visite={this._onVisite} catalogue={this._onCatalogue}/> : <SearchProductComponent />
        if(this.state.url) {
            networkExtension.activeOnlyLoop(this.state.url);
        }

        return (
            <Container>
                <StyleProvider style={customTheme}>
                    {display}
                </StyleProvider>
            </Container>
        )
    }

    constructor(props, context) {
        super(props, context);
        this._onCatalogue = this._onCatalogue.bind(this);
        this._onVisite = this._onVisite.bind(this);

        this.state = {
            url: null
        }

        assetManager.manage();
        zeroconfManager.manage(() => {
            // this.setState({url: zeroconfManager.getUrl()})
            this.setState({url: '192.168.1.127'});
        });
    }

    _onVisite() {
        this.props.navigation.push('Selection', {type: 'visite', url: this.state.url});
    }

    _onCatalogue() {
        this.props.navigation.push('Selection', {type: 'catalogue', url: this.state.url})
    }
}

const {height: screenHeight} = Dimensions.get("window");

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
        color: '#005797ff',
        fontSize: 48,
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 100
    }
});

const customTheme = {
    'holusion.IconCard': {
        container: {
            width: 300,
            height: 300,
            backgroundColor: '#00334cff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
        },
        icon: {
            width: 300 * 0.6,
            height: 300 * 0.6
        }
    }
}
