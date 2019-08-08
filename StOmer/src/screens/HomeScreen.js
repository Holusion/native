import React from 'react';

import { Container, StyleProvider, Toast } from 'native-base';
import DefaultHomeScreenComponent from "@components/screenComponents/DefaultHomeScreenComponent";

import {network, assetManager} from '@holusion/react-native-holusion';
import * as Config from '../../Config'

import { store } from "../utils/flux";
import * as actions from "../actions";

import {navigator} from "../../navigator"

/**
 * Encapsulate the two other view and change view when it's necessary
 */
export default class HomeScreen extends React.Component {
    render() {
        const url = this.props.navigation.getParam("url");
        return (
            <Container style={{flex: 1}}>
                <StyleProvider style={customTheme}>
                    <DefaultHomeScreenComponent url={url} onCardSelected={this._onCardSelected} onRemerciement={this._onRemerciement} />     
                </StyleProvider>
            </Container>
        )
    }

    constructor(props, context) {
        super(props, context);
        this._onCardSelected = this._onCardSelected.bind(this);
        this._onRemerciement = this._onRemerciement.bind(this);

        this.unsubscribe = store.subscribe((action) => {
            if(action.type == actions.Task.SET_TASK) {
                let elem = action.task
                let options = {
                    text: elem.message,
                    duration: 5000,
                    position: 'top'
                }
            
                if(elem.type) {
                    let type = elem.type;
                    switch(elem.type) {
                        case "warn": type = "warning"; break;
                        default: type = elem.type;
                    }
                    options['type'] = type;
                }
                
                Toast.show(options)
            }
        })

        if(this.props.navigation.getParam("url")) {
            this.props.navigation.setParams({'color': 'green'});
        }

        this.props.navigation.addListener('didFocus', async () => {
            let url = this.props.navigation.getParam('url');
            if(url) {
                try {
                    await network.activeOnlyYamlItems(url, assetManager.yamlCache);
                } catch(err) {
                    store.dispatch(actions.setErrorTask("http_request", err.message));
                }
            }
        })
    }

    _onCardSelected() {
        this.props.navigation.push(navigator.selection.id, {url: this.props.navigation.getParam('url')})
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
