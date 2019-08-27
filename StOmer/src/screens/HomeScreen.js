import React from 'react';

import { Container, StyleProvider, Toast } from 'native-base';
import { StyleSheet, View, TouchableOpacity, Text} from 'react-native';

import {network, assetManager} from '@holusion/react-native-holusion';
import * as Config from '../../Config'

import { store } from "../utils/flux";
import * as actions from "../actions";

import {navigator} from "../navigator"

import { IconCardComponent } from '@holusion/react-native-holusion'
import * as Config from '../../Config'

import resources from '../../resources'
import * as strings from '../../strings'




/**
 * Encapsulate the two other view and change view when it's necessary
 */
export default class HomeScreen extends React.Component {
    render() {
        const url = this.props.navigation.getParam("url");
        return (
            <Container style={{flex: 1}}>
                <StyleProvider style={customTheme}>
                    <View style={styles.container}>
                        <View style={styles.titleContainer}>
                            <Text style={[styles.catchphrase, {color: Config.remoteConfig.primaryColor}]}>
                                {Config.remoteConfig.welcomePhrase}
                            </Text>
                        </View>
                        <View style= {styles.cardContainer}>
                            <TouchableOpacity onPress={this.onCardSelected}>
                                <IconCardComponent source={resources.rightCardIcon} title={strings.home.rightCardTitle} customStyleProp={{container: {backgroundColor: Config.remoteConfig.primaryColor}}} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={this.onRemerciement} style={[styles.footerContainer, {backgroundColor: Config.remoteConfig.primaryColor}]}>
                            <View>
                                <Text style={styles.footerButton}>{strings.home.footerButton}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>  
                </StyleProvider>
            </Container>
        )
    }

    constructor(props, context) {
        super(props, context);
        this.onCardSelected = this._onCardSelected.bind(this);
        this.onRemerciement = this._onRemerciement.bind(this);

        customTheme['holusion.IconCardComponent'].container.backgroundColor = Config.remoteConfig.primaryColor;

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