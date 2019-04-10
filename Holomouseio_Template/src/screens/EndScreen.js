import React from 'react'

import { Text, StyleSheet, Image, ScrollView } from 'react-native'
import { Container, Content, Icon, Grid, Col, Row, Button } from 'native-base'
import { assetManager, network } from '@holusion/react-native-holusion';

import Markdown from 'react-native-markdown-renderer'

import RNFS from 'react-native-fs'

import * as Config from '../utils/Config'

export default class EndScreen extends React.Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerRight: <Icon style={{marginRight: 16, color: navigation.getParam('color', 'red')}} name="ios-wifi"/>
        }
    }

    renderLogo() {
        let allLogosFromYaml = this.props.navigation.getParam('objList').map(elem => assetManager.yamlCache[elem].logo).filter(elem => elem != null);
        let logo = ['holusion.png'];
        for(let i = 0; i < allLogosFromYaml.length; i++) {
            for(let j = 0; j < allLogosFromYaml[i].length; j++) {
                let elem = allLogosFromYaml[i][j]
                if(!logo.includes(elem)) {
                    logo.push(elem);
                }
            }
        }

        let holusionUri = `file://${RNFS.DocumentDirectoryPath}/${logo[0]}`;
        let lille1Uri = `file://${RNFS.DocumentDirectoryPath}/${logo[1]}`;
        let headerSize = 250;
        let header = <Row>
            <Col>
                <Image source={{uri: lille1Uri, scale: 1}} style={{width: headerSize, height: headerSize, marginTop: 8, resizeMode: 'contain', alignSelf: "center"}}/>
            </Col>
            <Col>
                <Image source={{uri: holusionUri, scale: 1}} style={{width: headerSize, height: headerSize, marginTop: 8, resizeMode: 'contain', alignSelf: "center"}}/>
            </Col>
        </Row>

        let display = [];
        display.push(header);
        let row = []
        for(let i = 2; i < logo.length; i++) {
            let uri = `file://${RNFS.DocumentDirectoryPath}/${logo[i]}`;
            let width = 150;
            let height = 150;
            if(logo[i] == 'holusion.png') {
                width = 250;
                height = 250;
            }

            row.push(
                <Col>
                    <Image key={i} source={{uri: uri, scale: 1}} style={{width: width, height: height, marginTop: 8, resizeMode: 'contain', alignSelf: "center"}}/>
                </Col>
            )

            if((i - 2) % 3 == 0 && (i-2) != 0) {
                display.push(
                    <Row>
                        {row}
                    </Row>
                )
                row = [];
            }
        }

        if(row.length > 0) {
            display.push(
                <Row>
                    {row}
                </Row>
            )
        }

        return <Grid>
            {display}
        </Grid>
    }

    renderText() {
        let txt = this.props.navigation.getParam('objList').map(elem => assetManager.yamlCache[elem]['Texte remerciement']).filter(elem => elem != null)[0];
        return <Markdown style={markdown}>{txt}</Markdown>
    }

    render() {
        return (
            <Container>
                <Content>
                    <Text style={styles.catchphrase}>Remerciements</Text>
                    <ScrollView style={{marginLeft: 32, marginRight: 32, marginBottom: 32}}>
                        {this.renderText()}
                        {this.renderLogo()}
                    </ScrollView>
                </Content>
            </Container>
        )
    }

    _onAccueil() {
        this.props.navigation.push('Home')
    }

    constructor(props, context) {
        super(props, context);

        this._onAccueil = this._onAccueil.bind(this);

        if(network.getUrl(0)) {
            this.props.navigation.setParams({'color': 'green'})
        }
    }
}

const styles = StyleSheet.create({
    content: {
        fontSize: 32, 
        color: Config.secondaryColor
    },
    catchphrase: {
        color: Config.primaryColor,
        fontSize: 48,
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 50
    }
});

const markdown = StyleSheet.create({
    em: {
        fontSize: 38,
        fontWeight: 'bold',
        color: Config.primaryColor,
    },
    text: {
        fontSize: 32, 
        color: Config.secondaryColor
    }
})