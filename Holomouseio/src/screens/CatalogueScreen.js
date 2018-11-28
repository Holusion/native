import React from 'react'

import { Container, StyleProvider } from 'native-base';
import { network, Playlist, assetManager } from '@holusion/react-native-holusion';

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
        let titles = this.props.navigation.getParam("objList").map(e => assetManager.yamlCache[e].Titre);

        return(
            <Container>
                <StyleProvider style={customTheme}>
                    <Playlist titles={titles} content={this.props.navigation.getParam("objList")} url={this.props.navigation.getParam('url')} actionItem={this._onPlayslistItem} />
                </StyleProvider>
            </Container>
        )
    }

    constructor(props, context) {
      super(props, context);
      this._onPlayslistItem = this._onPlayslistItem.bind(this);
    }
}

const customTheme = {
    'holusion.Playlist': {
        'holusion.IconCard': {
            container: {
                backgroundColor: "#fff",
                borderWidth: 2,
                borderColor: "#ae2573ff",
                margin: 4,
                padding: 0
            },
            icon: {
                width: 200 * 0.8,
                height: 200 * 0.8,
                resizeMode: 'contain'
            },
            titleContainer: {
                backgroundColor: "#ae2573ff",
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
