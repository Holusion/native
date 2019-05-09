import React from 'react';

import { Content, StyleProvider, Toast } from 'native-base';
import DefaultHomeScreenComponent from "../components/screenComponents/DefaultHomeScreenComponent";
import SearchScreenComponent from "../components/screenComponents/SearchScreenComponent";

import {network, assetManager} from '@holusion/react-native-holusion';
import FirebaseController from '../utils/FirebaseController'
import * as Config from '../../Config'

import { store } from "../stores/Store";
import * as actions from "../actions";

import * as strings from "../../strings.json"
import {navigator} from "../../navigator"
import { pushWarning, pushError, pushSuccess } from '../utils/Notifier';

/**
 * Encapsulate the two other view and change view when it's necessary
 */
export default class HomeScreen extends React.Component {

    async componentDidMount() {
        store.dispatch(actions.changeState(actions.AppState.DOWNLOAD_FIREBASE));

        let firebaseController = new FirebaseController(Config.projectName);
        try {
            let errors = await firebaseController.getFiles([
                {name: 'projects', properties: ['uri', 'thumb']},
                {name: 'logos', properties: ['logo']}
            ]);
            for(let err of errors) {
                pushWarning(err.error);
            }
        } catch(err) {
            let text = err.message;
            if(err.code === "firestore/unavailable") {
                text = "Impossible de se connecter à la base de donnée"
            }

            pushWarning(text);
        }
        try {
            await assetManager.manage();
        } catch(err) {
            pushError(err);
        }

        store.dispatch(actions.changeState(actions.AppState.SEARCH_PRODUCT));
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.closeConnection();
    }

    connectToProduct() {
        const launchOfflineMode = setTimeout(() => {
            store.dispatch(actions.changeState(actions.AppState.READY))
            pushWarning("Aucun produit trouvé")
        }, 5000);

        try {
            this.closeConnection = network.connect((service) => {
                clearTimeout(launchOfflineMode);
                let url = network.getUrl(0);
                this.props.navigation.setParams({color: 'green'})
                pushSuccess("Connecté sur " + service.name)
                store.dispatch(actions.changeState(actions.AppState.READY))
                this.setState(() => ({url: url}));
            }, () => {
                pushWarning("Produit déconnecté");
                this.setState(() => ({url: null}));
                this.props.navigation.setParams({color: 'red'})
            })
        } catch(err) {
            // mDNS error code : https://opensource.apple.com/source/mDNSResponder/mDNSResponder-98/mDNSShared/dns_sd.h.auto.html
            // CF URL Connection code : https://gist.github.com/mnkd/fa5911aa5808eda24298bf41b0436880
            pushError(err);
        }
    }

    componentDidUpdate() {
        switch(store.getState().appState) {
            case actions.AppState.SEARCH_PRODUCT:
                store.dispatch(actions.changeState(actions.AppState.WAIT_FOR_PRODUCT));
                this.connectToProduct()
                break;
            default:
        }
    }

    render() {
        let display = <SearchScreenComponent content={strings.home.content_start} />;

        switch(store.getState().appState) {
            case actions.AppState.SEARCH_PRODUCT:
                display = <SearchScreenComponent content={strings.home.content_product} />;
                break;
            case actions.AppState.READY:
                display = <DefaultHomeScreenComponent url={this.state.url} visite={this._onVisite} catalogue={this._onCatalogue} remerciement={this._onRemerciement} />;
                break;
            default:
                display = <SearchScreenComponent content={strings.home.content_files} />;
        }

        if(this.state.url) {
            try {
                network.activeOnlyYamlItems(this.state.url, assetManager.yamlCache);
            } catch(err) {
                pushError(err);
            }
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

        this.unsubscribe = store.subscribe(() => {
            this.setState(() => ({screenState: store.getState().appState}))
        })
    }

    _onVisite() {
        store.dispatch(actions.changeSelectionType(actions.SelectionType.VISITE));
        this.props.navigation.push(navigator.selection.id, {url: this.state.url});
    }

    _onCatalogue() {
        store.dispatch(actions.changeSelectionType(actions.SelectionType.CATALOGUE));
        this.props.navigation.push(navigator.selection.id, {url: this.state.url})
    }

    _onRemerciement() {
        this.props.navigation.push(navigator.remerciements.id);
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
