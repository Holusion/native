import React from 'react';

import { Content, Container, StyleProvider, Button, Grid, Col, Header, Right, Icon, Toast } from 'native-base';
import { StyleSheet, View, TouchableOpacity, Image, Text, ActivityIndicator, Dimensions, Animated, NetInfo } from 'react-native';
import {network, IconCard, zeroconfManager, assetManager} from '@holusion/react-native-holusion'
import FirebaseController from '../utils/FirebaseController'

class DefaultComponent extends React.Component {
    componentDidMount() {
        this.spring();
    }

    render() {
        return (
            <Content>
                <View>
                    <Image style={styles.images} source={require("../../assets/images/logo.png")} />
                    <Animated.Text style={{...styles.catchphrase, transform: [{scale: this.springValue}]}}>Bienvenue, touchez une carte</Animated.Text>
                    <View style= {{display: 'flex', flex: 1, flexDirection: "row", alignContent: 'center', justifyContent: 'center'}}>
                        <TouchableOpacity onPress={this.props.visite}>
                            <IconCard source={require("../../assets/icons/musee.png")} content="Visite" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.props.catalogue}>
                            <IconCard source={require("../../assets/icons/catalogue.png")} content="Catalogue"/>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={this.props.remerciement}>
                        <View style={{display: 'flex', justifyContent: 'center', flexDirection: 'row', margin: 32, backgroundColor: '#ae2573ff', borderRadius: 8, padding: 8, shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.8, shadowRadius: 10}}>
                            <Text style={{color: 'white', fontSize: 28}}>Remerciement</Text>
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

class SearchProductComponent extends React.Component {

    render() {

        let mainContent = "Recherche du produit...";
        if(this.props.loading) {
            mainContent = "Téléchargement des fichiers..."
        }

        return (
            <Content>
                <View style={{flex: 1, justifyContent: 'center', height: screenHeight}}>
                    <ActivityIndicator size="large" />
                    <Text style={{textAlign: 'center', color: "#ae2573ff", fontSize: 32}}>{mainContent}</Text>
                </View>
            </Content>
        )
    }
}

export default class HomeScreen extends React.Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerRight: <Icon style={{marginRight: 16, color: navigation.getParam('color', 'red')}} name="ios-wifi"/>
        }
    }

    async componentDidMount() {
        this.props.navigation.setParams({color: 'red'});
        let netInfo = await NetInfo.getConnectionInfo();
        if(netInfo.type && netInfo.type != 'none') {
            let firebaseController = new FirebaseController("Holomouseio");
            await firebaseController.getFiles([
                {name: 'projects', properties: ['uri', 'thumb']},
                {name: 'logos', properties: ['logo']}
            ]);
        }
        assetManager.manage();
        this.setState(() => {
            return {loading: false}
        })
    }

    render() {
        let display = !this.state.loading && (this.state.url || this.state.offlineMode) ? <DefaultComponent url={this.state.url} visite={this._onVisite} catalogue={this._onCatalogue} remerciement={this._onRemerciement} /> : <SearchProductComponent loading={this.state.loading} />
        
        if(this.state.url) {
            network.activeAll(this.state.url);
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
        this._onRemerciement = this._onRemerciement.bind(this);

        this.state = {
            url: null,
            offlineMode: false,
            loading: true
        }

        const launchOfflineMode = setTimeout(() => {
            this.setState(() => {
                return {offlineMode: true};
            })
            Toast.show({
                text: "Aucun produit trouvé",
                buttonText: "Ok",
                position: 'top'
            })
        }, 5000);
        
        zeroconfManager.manage(() => {
            clearTimeout(launchOfflineMode);
            let url = zeroconfManager.getUrl();
            this.props.navigation.setParams({color: 'green'})
            this.setState(() => {
                return {url: url, offlineMode: false, loading: false}
            });
            assetManager.manage();
        }, () => {
            Toast.show({
                text: "Produit déconnecté",
                buttonText: "Ok",
                position: 'top'
            })
            this.props.navigation.push('HomeScreen');
        })

    }

    _onVisite() {
        this.props.navigation.push('Selection', {type: 'visite', url: this.state.url});
    }

    _onCatalogue() {
        this.props.navigation.push('Selection', {type: 'catalogue', url: this.state.url})
    }

    _onRemerciement() {
        this.props.navigation.push('Remerciement');
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
        color: '#ae2573ff',
        fontSize: 48,
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 50
    }
});

const customTheme = {
    'holusion.IconCard': {
        container: {
            backgroundColor: "#ae2573ff",
            width: 300,
            height: 300,
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
