import React from 'react'

import { Container, StyleProvider } from 'native-base';
import { network, assetManager, Playlist } from '@holusion/react-native-holusion';
import * as zeroconManager from '../utils/zeroconfManager';
import * as networkExtension from '../utils/networkExtention';

import { StyleSheet, Text } from 'react-native';

export default class CatalogueScreen extends React.Component {

    componentDidMount() {
        if(zeroconManager.getUrl()) {
            networkExtension.activeOnlyLoop(this.props.navigation.getParam('url'));
        }
    }

    _onPlayslistItem(id) {
        this.props.navigation.push('Object', {
            objList: this.props.navigation.getParam("objList"),
            objId: id,
            url: this.props.navigation.getParam('url')
        });
    }

    render() {
        let content = this.props.navigation.getParam("objList");
        let titles = content.map(e => assetManager.yamlCache[e].Titre);

        return(
            <Container>
                <Text style={styles.catchPhrase}>Choisissez un objet</Text>
                <StyleProvider style={customTheme}>
                    <Playlist titles={titles} content={content} url={this.props.navigation.getParam('url')} actionItem={this._onPlayslistItem} />
                </StyleProvider>
            </Container>
        )
    }

    constructor(props, context) {
      super(props, context);
      this._onPlayslistItem = this._onPlayslistItem.bind(this);
    }
}

const styles = StyleSheet.create({
    catchPhrase: {
        color: "#005797ff",
        fontSize: 32,
        margin: 24,
        textAlign: 'left'
    },
})

const customTheme = {
    'holusion.Playlist': {
        'holusion.IconCard': {
            container: {
                backgroundColor: "#00334cff",
                margin: 4,
                width: 300,
                height: 300,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
            },
            icon: {
                width: 300 * 0.6,
                height: 300 * 0.6,
                resizeMode: 'contain'
            }
        }
    }
}
