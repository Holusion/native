import React from 'react';
import { Content, StyleProvider } from 'native-base';

import { store } from "../stores/Store";
import * as actions from "../actions";

import {network, assetManager} from '@holusion/react-native-holusion';
import * as Config from '../../Config'

import FirebaseController from '../utils/FirebaseController';
import SearchScreenComponent from "../components/screenComponents/SearchScreenComponent";

import * as strings from "../../strings.json"
import {navigator} from "../../navigator"
import { pushWarning, pushError, pushSuccess } from '../utils/Notifier';

export default class SetupScreen extends React.Component {

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
                pushSuccess("Connecté sur " + service.name);
                if(store.getState().appState === actions.AppState.WAIT_FOR_PRODUCT) {
                    store.dispatch(actions.changeState(actions.AppState.PRODUCT_FOUND))
                    this.setState(() => ({url: url}));
                }
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

    componentWillUnmount() {
        this.closeConnection();
        this.unsubscribe();
    }
    
    componentDidUpdate() {
        if(this.props.navigation.isFocused()) {
            switch(store.getState().appState) {
                case actions.AppState.SEARCH_PRODUCT:
                    store.dispatch(actions.changeState(actions.AppState.WAIT_FOR_PRODUCT));
                    this.connectToProduct()
                    break;
                case actions.AppState.PRODUCT_FOUND:
                    store.dispatch(actions.changeState(actions.AppState.READY));
                    break;
                case actions.AppState.READY:
                    if(this.state.url != null) this.props.navigation.push(navigator.home.id, {url: this.state.url});
                    break;
                default:
                    break;
            }
        }
    }

    render() {
        let display = <SearchScreenComponent content={strings.home.content_start} />;

        switch(store.getState().appState) {
            case actions.AppState.SEARCH_PRODUCT:
                display = <SearchScreenComponent content={strings.home.content_product} />;
                break;
            default:
                display = <SearchScreenComponent content={strings.home.content_files} />;
        }

        return (
            <Content enableResetScrollToCoords={false} disableKBDismissScroll={true}>
                <StyleProvider>
                    {display}     
                </StyleProvider>
            </Content>
        );
    }

    constructor(props, context) {
        super(props, context);

        
        this.state = {
            url: null,
            screenState: actions.AppState.INIT
        }
        
        this.unsubscribe = store.subscribe(() => {
            this.setState(() => ({screenState: store.getState().appState}))
        })
        
        this.props.navigation.addListener("didBlur", payload => {
            this.closeConnection();
            this.unsubscribe();
        })
    }
}