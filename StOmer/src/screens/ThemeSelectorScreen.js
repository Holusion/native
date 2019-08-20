import React from 'react';
import { Content } from 'native-base';
import { Text, StyleSheet, View } from 'react-native';

import { assetManager, network, ListItemComponent } from '@holusion/react-native-holusion'

import * as Config from '../../Config'

import { store } from "../utils/flux";

import {navigator} from '../../navigator'
import * as strings from '../../strings.json'
import * as actions from '../actions'

/**
 * Selection theme are rendered as list with two seperate color 
 */
export default class ThemeSelectorScreen extends React.Component {

    render() {
        let allList = [];
        
        let actualSelection = assetManager.allCatalogue;
        let catchphrase = strings.selection.catchphrase_collection;

        // color alternance for items
        for(let i = 0; i < actualSelection.length; i++) {
            let isPrimary = (i % 2 == 0); 
            let backgroundColor = isPrimary ? Config.primaryColor : null;
            let color = isPrimary ? "white" : Config.secondaryColor;

            allList.push(
                <ListItemComponent key={i} style={[{backgroundColor: backgroundColor}, styles.listItem]} onPress={() => this._onSelection(actualSelection[i])}>
                    <View style={styles.textContainer}>
                        <Text style={[{color: color}, styles.selectionText]}>{actualSelection[i]}</Text>
                    </View>
                </ListItemComponent>
            );
        }

        return (
            <Content>
                <View>
                    <Text  style={styles.catchPhrase}>{catchphrase}</Text>
                </View>
                <View style={styles.separator}></View>
                <View>
                    { allList }
                </View>
            </Content>
        )
    }

    constructor(props, context) {
        super(props, context);

        this._onSelection = this._onSelection.bind(this);

        // should be in an other class to include
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

    _onSelection(name) {
        let objs = assetManager.getObjectFromType('Collections', name);
        this.props.navigation.push(navigator.catalogue.id, {
            objList: objs,
            url: this.props.navigation.getParam('url')
        });
    }
}

const styles = StyleSheet.create({
    catchPhrase: {
        color: Config.primaryColor,
        fontSize: 32,
        margin: 24,
        textAlign: 'left'
    },
    
    selectionText: {
        fontSize: 26,
        paddingLeft: 16,
    },

    listItem: {
        height: 128,
        padding: 16,
    },
    textContainer: {
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent:'center'
    },
    separator: {
        borderWidth: 1, 
        borderColor: '#ccccccff', 
        marginLeft: 24, 
        marginRight: 24
    }
});