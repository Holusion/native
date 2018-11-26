import React from 'react'

import { Container, StyleProvider } from 'native-base';
import { network, Playlist } from '@holusion/react-native-holusion';

import { StyleSheet, Text } from 'react-native';

export default class CatalogueScreen extends React.Component {

    componentDidMount() {
        network.activeAll(this.props.navigation.getParam('url'));
    }

    _onPlayslistItem(id) {
        this.props.navigation.push('Object', {
            objList: this.props.navigation.getParam("objList"),
            objId: id,
            url: this.props.navigation.getParam('url')
        });
    }

    render() {
        return(
            <Container>
                <Text style={styles.catchPhrase}>Choisissez un objet</Text>
                <StyleProvider style={customTheme}>
                    <Playlist content={this.props.navigation.getParam("objList")} url={this.props.navigation.getParam('url')} actionItem={this._onPlayslistItem} />
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
                margin: 4
            }
        }
    }
}
