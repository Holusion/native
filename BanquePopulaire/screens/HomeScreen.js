import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Dimensions, ImageBackground } from 'react-native';
import { Container, Content } from 'native-base';
import Zeroconf from 'react-native-zeroconf';

import IconCard from '../components/IconCard';

class DefaultComponent extends React.Component {
    render() {
        return (
            <Content>
                <Image style={styles.image} source={require("../assets/images/LogoRDR-BPGO.png")}/>
                <Text style={styles.catchphrase}>Avez-vous des questions ?</Text>
                <View style={{display: 'flex', flex: 1, flexDirection: 'row', alignContent: 'center', justifyContent: 'center'}}>
                <TouchableOpacity onPress={this.props.enfant}>
                    <IconCard source={require('../assets/icons/enfant.png')} content="Je suis un enfant"/>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.props.adulte}>
                    <IconCard source={require('../assets/icons/adulte.png')} content="Je suis un adulte" />
                </TouchableOpacity>
                </View >
            </Content>
        )
    }

    constructor(props, context) {
        super(props, context);
    }
}

class SearchProductComponent extends React.Component {
    render() {
        return (
            <Content>
                <View style={{flex: 1, justifyContent: 'center', height: screenHeight}}>
                    <ActivityIndicator size="large"/>
                    <Text style={{textAlign: "center", color: '#043263ff', fontSize: 32}}>Recherche du produit...</Text>
                </View>
            </Content>
        )
    }
}

export default class HomeScreen extends React.Component {

    render() {
        let display = this.state.url ? <DefaultComponent url={this.state.url} enfant={this._onEnfant} adulte={this._onAdulte}/> : <SearchProductComponent />

        return (
            <Container>
            <ImageBackground source={require('../assets/images/home.jpg')} style={{width: "100%", height: '100%'}}>
                {display}
            </ImageBackground>
            </Container>
        );
    }

    constructor(props, context) {
        super(props, context);
        this._onEnfant = this._onEnfant.bind(this);
        this._onAdulte = this._onAdulte.bind(this);

        this.state = {
            url: null
        }

        zeroconf.scan('workstation', 'tcp', 'local.');
        zeroconf.on('resolved', (service) => {
            this.setState(() => {
                return {url: service.addresses[0]}
            });
        });
    }

    _onEnfant() {
        this.props.navigation.push('Question', {genre: 'enfant', url: this.state.url});
    }

    _onAdulte() {
        this.props.navigation.push('Question', {genre: 'adulte', url: this.state.url});
    }
    
}

const zeroconf = new Zeroconf();
const {height: screenHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
    image: {
        flex: 1,
        width: 200,
        height: 100,
        resizeMode: 'contain',
        alignSelf: 'flex-end',
    },

    catchphrase: {
        color: "#1592ccff",
        fontSize: 48,
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 100
    }
})