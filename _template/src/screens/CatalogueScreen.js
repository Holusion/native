import React from 'react'

import { Container, StyleProvider } from 'native-base';
import { assetManager, network } from '@holusion/react-native-holusion';
import { playlistFromContents, PlaylistComponent } from '@holusion/react-native-holusion';

import { StyleSheet, Text } from 'react-native'

import * as Config from '../../Config'

import * as strings from '../../strings.json'
import {navigator} from '../../navigator'
import * as actions from '../actions'
import { store } from '../utils/flux';

/**
 * Catalogue screen is the screen with small cards that represent by collection. Click on a card has effect to open Object screen of selected object 
 */
export default class CatalogueScreen extends React.Component {

    _onPlayslistItem(id) {
        // Store the collection of yaml passed in navigation param
        store.dispatch(actions.setVideo(this.props.navigation.getParam('objList'), id))

        this.props.navigation.push(navigator.object.id, {
            url: this.props.navigation.getParam('url'),
            title: assetManager.yamlCache[store.getState().objectVideo.video]['Titre']
        });
    }

    render() {
        return(
            <Container>
                <Text style={[styles.catchPhrase, {color: Config.remoteConfig.primaryColor}]}>{strings.catalogue.catchphrase}</Text>
                <StyleProvider style={customTheme}>
                    <PlaylistComponent playlist={this.playlist} actionItem={this._onPlayslistItem} />
                </StyleProvider>
            </Container>
        )
    }
    
    constructor(props, context) {
        super(props, context);

        customTheme['holusion.PlaylistComponent']['holusion.IconCardComponent'].container.borderColor = Config.remoteConfig.primaryColor;
        customTheme['holusion.PlaylistComponent']['holusion.IconCardComponent'].titleContainer.backgroundColor = Config.remoteConfig.primaryColor;

        this._onPlayslistItem = this._onPlayslistItem.bind(this);
        if(this.props.navigation.getParam("url")) {
            this.props.navigation.setParams({'color': 'green'});
        }
        
        let objList = this.props.navigation.getParam("objList");
        let contents = objList.map(elem => {
            return {name: Config.projectName + "/" + elem, title: assetManager.yamlCache[elem].Titre}
        })
        this.playlist = playlistFromContents(this.props.navigation.getParam('url'), contents)

        this.props.navigation.addListener('didFocus', async () => {
            let url = this.props.navigation.getParam('url');
            if(url) {
                try {
                    // Should only active items from current collection
                    await network.activeOnlyYamlItems(url, assetManager.yamlCache);
                } catch(err) {
                    store.dispatch(actions.setErrorTask("http_request", err.message));
                }
            }
        })
    }
}

const styles = StyleSheet.create({
    catchPhrase: {
        fontSize: 32,
        margin: 24,
        textAlign: 'left'
    }
})

const customTheme = {
    'holusion.PlaylistComponent': {
        'holusion.IconCardComponent': {
            container: {
                backgroundColor: "#fff",
                borderWidth: 2,
                margin: 4,
                padding: 0,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
            },
            icon: {
                width: 200 * 0.8,
                height: 200 * 0.8,
                resizeMode: 'contain'
            },
            titleContainer: {
                width: '100%',
                height: '25%',
                flex: 1,
                justifyContent: 'center',
                marginLeft: 0,
                paddingLeft: 4,
                paddingRight: 4
            }
        }
    }
}
