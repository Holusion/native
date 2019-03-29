import React from 'react'
import { Container, Content, Grid, Col, Row, Icon } from 'native-base';
import { Text, StyleSheet, ScrollView, Image } from 'react-native';
import { assetManager, network } from '@holusion/react-native-holusion';

import RNFS from 'react-native-fs';

import * as Config from '../utils/Config'

export default class RemerciementScreen extends React.Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerRight: <Icon style={{marginRight: 16, color: navigation.getParam('color', 'red')}} name="ios-wifi"/>
        }
    }

    renderLogo() {
        let allLogosFromYaml = Object.keys(assetManager.yamlCache).map(elem => assetManager.yamlCache[elem].logo).filter(elem => elem != null);
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
        let headerSize = 250;
        let header = <Row>
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
                    <Text style={styles.catchphrase}>Remerciements</Text>
                    <ScrollView style={{marginLeft: 32, marginRight: 32}}>
                        <Text style={styles.content}>
                            <Text style={{fontWeight: 'bold'}}>Holusion{"\n"}</Text>
                            <Text style={{fontWeight: 'bold'}}>Thibault Guillaumont</Text>, Co-fondateur{"\n"}
                            <Text style={{fontWeight: 'bold'}}>Yann Dubois</Text>, Chef de projet informatique et technique{"\n"}{"\n"}
                        </Text>
                        {this.renderLogo()}
                    </ScrollView>
                </Content>
            </Container>
        )
    }

    constructor(props, context) {
        super(props, context);
        if(network.getUrl()) {
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