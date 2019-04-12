import React from 'react';

import { Content, StyleProvider, Icon, Toast } from 'native-base';
import DefaultHomeScreenComponent from "../components/screenComponents/DefaultHomeScreenComponent";
import SearchScreenComponent from "../components/screenComponents/SearchScreenComponent";

import {network, assetManager} from '@holusion/react-native-holusion';
import FirebaseController from '../utils/FirebaseController'
import * as Config from '../utils/Config'
import * as networkExtension from '../utils/networkExtension';

import { store } from "../stores/appStore";
import * as actions from "../actions";

/**
 * Encapsulate the two other view and change view when it's necessary
 */
export default class HomeScreen extends React.Component {

    async componentDidMount() {
        store.dispatch(actions.changeState(actions.AppState.DOWNLOAD_FIREBASE));

        const isConnected = await network.hasInternetConnection();

        if(isConnected) {
            let firebaseController = new FirebaseController(Config.projectName);
            await firebaseController.getFiles([
                {name: 'projects', properties: ['uri', 'thumb']},
                {name: 'logos', properties: ['logo']}
            ]);
            assetManager.manage();
        }

        store.dispatch(actions.changeState(actions.AppState.SEARCH_PRODUCT));
    }

    connectToProduct() {
        const launchOfflineMode = setTimeout(() => {
            store.dispatch(actions.changeState(actions.AppState.READY))
            Toast.show({
                text: "Aucun produit trouvé",
                buttonText: "Ok",
                position: 'top'
            })
        }, 5000);

        network.connect(() => {
            clearTimeout(launchOfflineMode);
            let url = network.getUrl(0);
            this.props.navigation.setParams({color: 'green'})
            store.dispatch(actions.changeState(actions.AppState.READY))
            this.setState(() => ({url: url}));
            assetManager.manage();
        }, () => {
            Toast.show({
                text: "Produit déconnecté",
                buttonText: "Ok",
                position: 'top'
            })
            this.props.navigation.setParams({color: 'red'})
            this.props.navigation.push('HomeScreen');
        })
    }

    componentDidUpdate() {
        switch(store.getState().appState) {
            case actions.AppState.SEARCH_PRODUCT:
                this.connectToProduct()
                break;
            default:
        }
    }

    render() {
        let display = <SearchScreenComponent content="Démarrage" />;

        switch(store.getState().appState) {
            case actions.AppState.SEARCH_PRODUCT:
                display = <SearchScreenComponent content="Recherche du produit..." />;
                break;
            case actions.AppState.READY:
                display = <DefaultHomeScreenComponent url={this.state.url} visite={this._onVisite} catalogue={this._onCatalogue} remerciement={this._onRemerciement} />;
                break;
            default:
                display = <SearchScreenComponent content="Téléchargement des fichiers..." />;
        }

        if(this.state.url) {
            networkExtension.activeOnlyYamlItems(this.state.url, assetManager.yamlCache);
        }

        return (
            <Content enableResetScrollToCoords={false} disableKBDismissScroll={true}>
                <StyleProvider style={customTheme}>
                    {display}     
                </StyleProvider>
            </Content>
        )
    }

    constructor(props, context) {
        super(props, context);
        this._onCatalogue = this._onCatalogue.bind(this);
        this._onVisite = this._onVisite.bind(this);
        this._onRemerciement = this._onRemerciement.bind(this);

        this.state = {
            url: null,
            screenState: actions.AppState.INIT
        }

        store.subscribe(() => {
            this.setState(() => ({screenState: store.getState().appState}))
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

const customTheme = {
    'holusion.IconCardComponent': {
        container: {
            backgroundColor: Config.primaryColor,
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
