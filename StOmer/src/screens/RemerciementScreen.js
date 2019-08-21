import React from 'react'
import { Container, Content, Grid, Col, Row } from 'native-base';
import { Text, StyleSheet, ScrollView, Image } from 'react-native';
import { assetManager } from '@holusion/react-native-holusion';

import RNFS from 'react-native-fs';

import * as Config from '../../Config'
import Markdown from 'react-native-markdown-renderer';

/**
 * This screen renders the remerciement page
 */
export default class RemerciementScreen extends React.Component {

    renderLogo() {
        let allLogosFromYaml = Object.keys(assetManager.yamlCache).map(elem => assetManager.yamlCache[elem].logo).filter(elem => elem != null);
        let logo = ['holusion.png', 'comue.png'];
        for(let i = 0; i < allLogosFromYaml.length; i++) {
            for(let j = 0; j < allLogosFromYaml[i].length; j++) {
                let elem = allLogosFromYaml[i][j]
                if(!logo.includes(elem)) {
                    logo.push(elem);
                }
            }
        }

        let holusionUri = `file://${RNFS.DocumentDirectoryPath}/${logo[0]}`;
        let lille1Uri = `file://${RNFS.DocumentDirectoryPath}/${logo[2]}`;
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
        display.push(header)
        let row = []
        for(let i = 1; i < logo.length; i++) {
            if(logo[i] == "logo.png") continue;

            let uri = `file://${RNFS.DocumentDirectoryPath}/${logo[i]}`;
            let width = 150;
            let height = 150;
            if(logo[i] == 'holusion.png') {
                width = 250;
                height = 250;
            }

            row.push(
                <Col key={i}>
                    <Image key={i} source={{uri: uri, scale: 1}} style={{width: width, height: height, marginTop: 8, resizeMode: 'contain', alignSelf: "center"}}/>
                </Col>
            )

            if((i - 1) % 3 == 0 && (i - 1) != 0) {
                display.push(
                    <Row key={i}>
                        {row}
                    </Row>
                )
                row = [];
            }
        }

        if(row.length > 0) {
            display.push(
                <Row key={logo.length}>
                    {row}
                </Row>
            )
        }

        return <Grid>
            {display}
        </Grid>
    }

    render() {
        return (
            <Container>
                <Content>
                    <Text style={[styles.catchphrase, {color: Config.remoteConfig.primaryColor}]}>Remerciements</Text>
                    <ScrollView style={{marginLeft: 32, marginRight: 32}}>
                        <Markdown style={{text: {fontSize: 32, color: Config.remoteConfig.textColor}}}>
                            {Config.remoteConfig.remerciements}
                        </Markdown>
                        {this.renderLogo()}
                    </ScrollView>
                </Content>
            </Container>
        )
    }

    constructor(props, context) {
        super(props, context);
        if(this.props.navigation.getParam("url")) {
            this.props.navigation.setParams({'color': 'green'})
        }
    }
}

const styles = StyleSheet.create({
    content: {
        fontSize: 32,
    },
    catchphrase: {
        fontSize: 48,
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 50
    }
});