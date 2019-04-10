import React from 'react'

import { Container, StyleProvider, Icon } from 'native-base';
import { network, assetManager } from '@holusion/react-native-holusion';
import {Playlist} from '@holusion/react-native-holusion';

import { StyleSheet, Text } from 'react-native'

import * as networkExtension from '../utils/networkExtension'
import * as Config from '../utils/Config'
import PlaylistComponent from '../components/PlaylistComponent'

/**
 * Catalogue screen is the screen with small cards that represent by collection. Click on a card has effect to open Object screen of selected object 
 */
export default class CatalogueScreen extends React.Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerRight: <Icon style={{marginRight: 16, color: navigation.getParam('color', 'red')}} name="ios-wifi"/>
        }
    }

    componentDidMount() {
        if(network.getUrl()) {
            networkExtension.activeOnlyYamlItems(this.props.navigation.getParam('url'), assetManager.yamlCache);
        }
    }

    _onPlayslistItem(id) {
        this.props.navigation.push('Object', {
            objList: this.props.navigation.getParam("objList"),
            objId: id,
            url: this.props.navigation.getParam('url'),
            type: this.props.navigation.getParam('type')
        });
    }

    render() {
        let titles = this.props.navigation.getParam("objList").map(e => assetManager.yamlCache[e].Titre);
        
        return(
            <Container>
                <Text style={styles.catchPhrase}>Choisissez un objet</Text>
                <StyleProvider style={customTheme}>
                    <PlaylistComponent titles={titles} playlist={this.playlist} actionItem={this._onPlayslistItem} />
                </StyleProvider>
            </Container>
        )
    }
    
    constructor(props, context) {
        super(props, context);
        this._onPlayslistItem = this._onPlayslistItem.bind(this);
        if(network.getUrl()) {
            this.props.navigation.setParams({'color': 'green'});
        }
        this.playlist = new Playlist(network.getUrl(), this.props.navigation.getParam("objList"), true);
    }
}

const styles = StyleSheet.create({
    catchPhrase: {
        color: Config.primaryColor,
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
                borderColor: Config.primaryColor,
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
                backgroundColor: Config.primaryColor,
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
