import React from 'react';
import { Content } from 'native-base';
import { Text, StyleSheet, View } from 'react-native';

import { assetManager, network } from '@holusion/react-native-holusion'
import ListItemComponent from "../components/ListItemComponent";

import * as Config from '../../Config'

import { store } from "../stores/Store";
import { SelectionType } from "../actions"

import {navigator} from '../../navigator'
import * as strings from '../../strings.json'
import { pushError } from '../utils/Notifier';

/**
 * Selection theme are rendered as list with two seperate color 
 */
export default class ThemeSelectorScreen extends React.Component {

    componentDidMount() {
        if(this.props.navigation.getParam("url")) {
            try {
                network.activeOnlyYamlItems(this.props.navigation.getParam('url'), assetManager.yamlCache);
            } catch(err) {
                pushError(err);
            }
        }
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        let allList = [];
        
        let actualSelection = assetManager.allCatalogue;
        let catchphrase = strings.selection.catchphrase_collection;
        
        if(store.getState().selectionType === SelectionType.VISITE) {
            actualSelection = assetManager.allTheme;
            catchphrase = strings.selection.catchphrase_theme;
        }

        for(let i = 0; i < actualSelection.length; i++) {
            let isPurple = (i % 2 == 0);
            let backgroundColor = isPurple ? Config.primaryColor : null;
            let color = isPurple ? "white" : Config.secondaryColor;

            allList.push(
                <ListItemComponent key={i} style={[{backgroundColor: backgroundColor}, styles.listItem]} onPress={() => this._onSelection(actualSelection[i])}>
                    <View style={{display: 'flex', flexDirection: 'column', justifyContent:'center'}}>
                        <Text style={[{color: color}, styles.selectionText]}>{actualSelection[i].replace('Thème : ', '')}</Text>
                    </View>
                </ListItemComponent>
            );
        }

        return (
            <Content>
                <View>
                    <Text  style={styles.catchPhrase}>{catchphrase}</Text>
                </View>
                <View style={{borderWidth: 1, borderColor: '#ccccccff', marginLeft: 24, marginRight: 24}}></View>
                <View>
                    { allList }
                </View>
            </Content>
        )
    }

    constructor(props, context) {
        super(props, context);

        this.props.navigation.addListener('willFocus', payload => {
            if(this.props.navigation.getParam("url")) {
                try {
                    network.activeOnlyYamlItems(this.props.navigation.getParam('url'), assetManager.yamlCache);
                } catch(err) {
                    pushError(err);
                }
            }
        })

        this.state = { type: SelectionType.ANY_SELECTION }

        this._onSelection = this._onSelection.bind(this);

        if(this.props.navigation.getParam("url")) {
            this.props.navigation.setParams({'color': 'green'});
        }

        this.unsubscribe = store.subscribe(() => {
            this.setState(() => ({type: store.getState().selectionType}))
        })
    }

    _onSelection(name) {
        let realType = store.getState().selectionType === SelectionType.CATALOGUE ? 'Collections' : 'Theme'
        let objs = assetManager.getObjectFromType(realType, name);

        switch(store.getState().selectionType) {
            case SelectionType.VISITE:
                this.props.navigation.push(navigator.object.id, {
                    objList: objs,
                    objId: 0,
                    url: this.props.navigation.getParam('url')
                });
                break;
            default:
                this.props.navigation.push(navigator.catalogue.id, {
                    objList: objs,
                    url: this.props.navigation.getParam('url')
                })
        }
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
        paddingLeft: 16
    },

    listItem: {
        height: 128,
        padding: 16
    }
});