import React from 'react';
import { Content, StyleProvider, Button } from 'native-base';

import { store } from "../stores/Store";
import * as actions from "../actions";

import {network, assetManager} from '@holusion/react-native-holusion';
import * as Config from '../../Config'

import FirebaseController from '../utils/FirebaseController';

import * as strings from "../../strings.json"
import * as notifier from '../utils/Notifier';
import {navigator} from '../../navigator';
import RetryButtonComponent from '../components/RetryButtonComponent';
import getTheme from '../../native-base-theme/components';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import HandlePanelComponent from '../components/HandlePanelComponent';

export default class SetupScreen extends React.Component {
    
    componentDidMount() {
        store.dispatch(actions.changeState(actions.AppState.DOWNLOAD_FIREBASE));
    }

    async reactDownloadFirebase() {
        let firebaseController = new FirebaseController(Config.projectName);
        notifier.setInfoTask("firebase_yaml", "Téléchargement des fichiers yaml");
        
        try {
            let files = await firebaseController.getFiles([
                {name: 'projects', properties: ['uri', 'thumb']},
                {name: 'logos', properties: ['logo']}
            ]);
            let errors = files.filter(elem => elem instanceof Error);
            for(err of errors) {
                notifier.setErrorTask("files", err.message);   
            }
            
            notifier.setSuccessTask("firebase_yaml", "Tout les fichiers ont été téléchargé");
        } catch(err) {
            let text = err.message;
            if(err.code === "firestore/unavailable") {
                text = strings.errors.firebase.databaseUnavailable
            }
            
            notifier.setWarningTask("firebase_yaml", text, await this.reactDownloadFirebase);
        }
        try {
            await assetManager.manage();
        } catch(err) {
            notifier.setErrorTask("load_yaml", err.message);
        }
        
        if(store.getState().appState == actions.AppState.DOWNLOAD_FIREBASE) store.dispatch(actions.changeState(actions.AppState.SEARCH_PRODUCT));
    }
    
    connectToProduct() {
        notifier.setInfoTask("search_product", "Recherche d'un produit sur le réseau")
        store.dispatch(actions.changeState(actions.AppState.WAIT_FOR_PRODUCT));

        const launchOfflineMode = setTimeout(() => {
            notifier.setWarningTask("search_product", "Problème de connexion, aucun produit n'a été trouvé, vérifiez votre connexion et réessayez");
            store.dispatch(actions.changeState(actions.AppState.READY))
        }, 5000);

        try {
            this.closeConnection = network.connect((service) => {
                clearTimeout(launchOfflineMode);
                let url = network.getUrl(0);
                this.props.navigation.setParams({color: 'green'})
                if(store.getState().appState === actions.AppState.WAIT_FOR_PRODUCT) {
                    store.dispatch(actions.changeState(actions.AppState.PRODUCT_FOUND))
                    this.setState(() => ({url: url}));
                }
                notifier.setSuccessTask("search_product", `Connecté sur le produit : ${service.name}`)
            }, () => {
                notifier.setWarningTask("search_product", "Produit déconnecté");
                this.setState(() => ({url: null}));
                this.props.navigation.setParams({color: 'red'})
            })
        } catch(err) {
            // mDNS error code : https://opensource.apple.com/source/mDNSResponder/mDNSResponder-98/mDNSShared/dns_sd.h.auto.html
            // CF URL Connection code : https://gist.github.com/mnkd/fa5911aa5808eda24298bf41b0436880
            notifier.setErrorTask("search_product", err.message);
        }
    }

    componentWillUnmount() {
        this.closeConnection();
        this.unsubscribe();
    }
    
    async componentDidUpdate(prevProps, prevState) {
        if(this.props.navigation.isFocused() && prevState.screenState != this.state.screenState) {
            switch(store.getState().appState) {
                case actions.AppState.DOWNLOAD_FIREBASE:
                    await this.reactDownloadFirebase();
                    break;
                case actions.AppState.SEARCH_PRODUCT:
                    this.connectToProduct();
                    break;
                case actions.AppState.PRODUCT_FOUND:
                    store.dispatch(actions.changeState(actions.AppState.READY));
                    break;
                default:
                    break;
            }
        }
    }

    render() {
        let display = []
        
        for(let [key, value] of this.state.tasks) {
            display.push(<HandlePanelComponent taskName={key} task={value}/>)
        }

        let continueButton = null;
        if(store.getState().appState == actions.AppState.READY) {
            continueButton = <Button key={0} style={styles.button} onPress={() => this.props.navigation.push(navigator.home.id, {url: this.state.url})}>
                                <Text style={styles.textButton}>Continuer</Text>
                            </Button>
        }

        return (
            <Content>
                <StyleProvider style={getTheme()}>
                    <View style={{display: 'flex', flexDirection: "column", alignItems: 'center'}}>
                        <Text style={styles.catchphrase}>Résumé des étapes de Setup</Text>
                        <View style={{margin: 20, shadowColor: "#000", shadowOffset: {width: 1, height: 2}, shadowOpacity: 0.8, shadowRadius: 5}}>
                            {display}
                        </View>
                        {continueButton}
                    </View>
                </StyleProvider>
            </Content>
        )
    }

    constructor(props, context) {
        super(props, context);
        
        this.state = {
            url: null,
            screenState: actions.AppState.INIT,
            tasks: new Map()
        }
        
        this.unsubscribe = store.subscribe(() => {
            this.setState(() => ({screenState: store.getState().appState}))
        })

        this.unsubscribeNotifier = notifier.subscribe(() => {
            this.setState(() => ({tasks: notifier.getTasks()}))
        })
        
        this.props.navigation.addListener("didBlur", payload => {
            this.unsubscribe();
            this.unsubscribeNotifier();
        })
    }
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        height: screenHeight,
        justifyContent: "center"
    },
    button: {
        backgroundColor: Config.primaryColor, 
        margin: 4, 
        marginBottom: 16, 
        alignSelf: 'center', 
        width: 225, 
        justifyContent: 'center'
    },
    textButton: {
        fontSize: 18, 
        fontWeight: 'bold',
        color: "#fff"
    },
    catchphrase: {
        textAlign: 'center', 
        color: Config.primaryColor, 
        fontSize: 32,
        margin: 24
    },
})

const {height: screenHeight} = Dimensions.get("window");