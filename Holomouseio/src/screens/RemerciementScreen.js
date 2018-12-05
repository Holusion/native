import React from 'react'
import { Container, Content, Grid, Col, Row, Icon } from 'native-base';
import { Text, StyleSheet, ScrollView, Image } from 'react-native';
import { assetManager, zeroconfManager } from '@holusion/react-native-holusion';

import RNFS from 'react-native-fs';

export default class RemerciementScreen extends React.Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerRight: <Icon style={{marginRight: 16, color: navigation.getParam('color', 'red')}} name="ios-wifi"/>
        }
    }

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

        let display = [];
        let row = []
        for(let i = 0; i < logo.length; i++) {
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

            if(i % 3 == 0) {
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
                            <Text style={{fontWeight: 'bold'}}>Université de Lille{"\n"}</Text>
                            Sophie Braun, Chargée du patrimoine scientifique, Direction Culture{"\n"}
                            Bernard Mikolajczyk, Ingénieur multimédia, Direction de l’Innovation Pédagogique{"\n"}
                            Bernard Deleplanque, Ingénieur multimédia, Direction de l’Innovation Pédagogique{"\n"}
                            Didier Devauchelle, Professeur d&#39;égyptologie, UMR 8164 HALMA{"\n"}
                            Ghislaine Widmer, Maître de conférences en égyptologie, UMR 8164 HALMA{"\n"}
                            Thomas Gamelin, Égyptologue, chargé de cours, UMR 8164 HALMA{"\n"}
                            Jessie Cuvelier, Ingénieur d’études CNRS, UMR 8198 Évo-Éco-Paléo,{"\n"}
                            Camille De Visscher, Chargée de médiation scientifique, Direction de la Valorisation de la Recherche{"\n"}{"\n"}

                            <Text style={{fontWeight: 'bold'}}>Palais des Beaux-Arts de Lille{"\n"}</Text>
                            Fleur Morfoisse, égyptologue, conservateur en chef, Antiquités / Arts décoratifs, Palais des Beaux-Arts de Lille{"\n"}
                            Karine Dautel, titre{"\n"}{"\n"}

                            <Text style={{fontWeight: 'bold'}}>Centre historique minier de Lewarde{"\n"}</Text>
                            Amy Benadiba, directrice-conservatrice{"\n"}{"\n"}

                            <Text style={{fontWeight: 'bold'}}>Holusion{"\n"}</Text>
                            Thibault Guillaumont, Co-fondateur{"\n"}
                            Yann Dubois, Chef de projet informatique et technique{"\n"}{"\n"}

                            <Text style={{fontWeight: 'bold'}}>ComUE Lille Nord de France / &amp; / Muséomix Nord{"\n"}</Text>
                            Antoine Matrion, Chargé du patrimoine scientifique, Service Culture
                        </Text>
                        {this.renderLogo()}
                    </ScrollView>
                </Content>
            </Container>
        )
    }

    constructor(props, context) {
        super(props, context);
        if(zeroconfManager.getUrl()) {
            this.props.navigation.setParams({'color': 'green'})
        }
    }
}

const styles = StyleSheet.create({
    content: {
        fontSize: 24
    },
    catchphrase: {
        color: '#ae2573ff',
        fontSize: 48,
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 50
    }
});