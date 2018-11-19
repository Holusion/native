import React from 'react'
import { Content, Footer, FooterTab, Text, Button, Container, Body, Icon, Grid, Col, Row } from 'native-base';

import YAMLObjectComponent from '../components/YAMLObjectComponent';
import { yamlCache } from '../utils/AssetManager'
import { Modal, StyleSheet, View, Image, ScrollView } from 'react-native';

import { desactivateAll, active, play } from '../utils/Network';
import RNFS from 'react-native-fs';

export default class ObjectScreen extends React.Component {
    activeModal(number) {
        this.setState({modalVisible: number})
    }

    launchVideo(videoName) {
        let productUrl = this.props.navigation.getParam('url');

        desactivateAll(productUrl).then(elem => {
            active(productUrl, `${videoName}.mp4`)
        }).then(_ => {
            play(productUrl, `${videoName}.mp4`)
        }).catch(err => {
            console.error(err);
        })

    }

    renderModal(number) {
        let display = null;
        if(number === 0) {
            display = refs.map((s, index) => {
                if(this.obj && this.obj[s]) {
                    return <Text style={styles.modalText} key={index}>{s}: {this.obj[s]}</Text>
                }
                return null;
            })
        } else if(number > 0) {
            let text = "";
            if(this.obj) {
                text = this.obj[`Texte complémentaire ${number}`];
            }
            display = <Text style={styles.modalText}>{text}</Text>
        }

        return (
            <Modal key={number} animationType="slide" transparent={false} visible={this.state.modalVisible == number} style={styles.modal}>
                <View style={styles.modalContent}>
                    {display}
                </View>
                <View style={styles.modalFooter}>
                    <Body style={styles.modalButton}>
                        <Button bordered onPress={() => this.activeModal(-1)}>
                            <Text>Revenir sur l'objet</Text>
                        </Button>
                    </Body>
                </View>
            </Modal>
        )
    }

    generateFooter() {
        let compls = [];
        if(this.obj) {
            compls = Object.keys(this.obj).filter(elem => elem.indexOf('compl') == 6); //#startsWith made something strange :/
        }

        return (
            <FooterTab>
                <Button onPress={() => this.activeModal(0)}>
                    <Text>Référence de l'objet</Text>
                </Button>
                {
                    compls.map((element, index) => {
                        const elemSplit = element.split(' ');
                        let number = parseInt(elemSplit[elemSplit.length - 1]);
                        return <Button key={index} onPress={() => this.activeModal(number)}>
                            <Text>Info compl {number}</Text>
                        </Button>
                    })
                }
            </FooterTab>
        );
    }

    generateAllModal() {
        let modals = [];
        modals.push(this.renderModal(0));

        for(let i = 1; i <= this.complLength; i++) {
            modals.push(this.renderModal(i));
        }

        return modals;
    }

    render() {
        let allModals = this.generateAllModal();
        let imageUri = `file://${RNFS.DocumentDirectoryPath}/${this.props.navigation.getParam('objList')[this.state.currentVideoIndex]}.jpg`;

        return (
            <Container>
                {allModals}
                <Grid>
                    <Col style={styles.rightPanel} onPress={this._onPrevious}>
                        <Icon name="ios-arrow-back" style={styles.rightIcon}/>
                        <Text style={styles.rightContent}>Objet précédent</Text>
                    </Col>
                    <Col>
                        <Row size={1}>
                            <Text style={styles.title}>{this.obj['Titre']}</Text>
                        </Row>
                        <Row size={1} style={styles.mainPanel}>
                            <Image source={{uri: `${imageUri}`, scale: 1}} style={{width:125, height:125, marginTop: 8}}/>
                        </Row>
                        <Row size={4} style={styles.mainPanel}>
                            <ScrollView style= {{marginTop: 16}}>
                                <YAMLObjectComponent style={styles.content} data={this.obj}/>
                            </ScrollView>
                        </Row>
                    </Col>
                    <Col style={styles.rightPanel} onPress={this._onNext}>
                        <Icon name="ios-arrow-forward" style={styles.rightIcon} />
                        <Text style={styles.rightContent}>Objet suivant</Text>
                    </Col>
                </Grid>
                <Footer>
                    {this.generateFooter()}
                </Footer>
            </Container>
        )
    }

    _onNext() {
        if(this.state.currentVideoIndex + 1 >= this.props.navigation.getParam('objList').length) {
            desactivateAll(this.props.navigation.getParam('url'));
            this.props.navigation.push('End');
        } else {
            let nextVideo = this.props.navigation.getParam('objList')[this.state.currentVideoIndex + 1];
            this.obj = yamlCache[nextVideo];
            this.launchVideo(nextVideo);
            this.setState({currentVideoIndex: this.state.currentVideoIndex + 1});
        }
    }

    _onPrevious() {
        if(this.state.currentVideoIndex <= 0) {
            return;
        } else {
            let previousVideo = this.props.navigation.getParam('objList')[this.state.currentVideoIndex - 1];
            this.obj = yamlCache[previousVideo];
            this.launchVideo(previousVideo);
            this.setState({currentVideoIndex: this.state.currentVideoIndex - 1});
        }
    }

    constructor(props, context) {
        super(props, context);
        let currentObj = this.props.navigation.getParam('objList')[this.props.navigation.getParam('objId')];
        
        this.obj = yamlCache[currentObj]

        this.state = {
            modalVisible: -1,
            currentVideoIndex: this.props.navigation.getParam('objId')
        }
        this.complLength = 0;
        this.complLength = Object.keys(this.obj).filter(elem => elem.indexOf('compl') == 6).length;

        this.launchVideo(currentObj);

        this._onNext = this._onNext.bind(this);
        this._onPrevious = this._onPrevious.bind(this);
    }
}

const refs = ['Titre', 'Collections', 'Theme', "Numéro d'inventaire", 'Propriétaire', 'Unité', 'Collection', 'Dépositaire', 'Discipline', 'Date ou Période', 'Artiste', 'Fabricant', 'Matériau', 'Type'];
const styles = StyleSheet.create({
    modal: {
        margin: 16,
        display: 'flex',
        flexDirection: "column",
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        flex: 4,
        display: 'flex',
        justifyContent: "center",
    },
    modalText: {
        textAlign: "left",
        color: '#3c0c27ff',
        marginLeft: 32,
        fontSize: 24
    },
    modalFooter: {
        flex: 1
    },
    modalButton: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    content: {
        color: "#3c0c27ff",
        fontSize: 18,
        padding: 24
    },
    mainPanel: {
        display: 'flex',
        alignItems: "center",
        justifyContent: 'center'

    },
    rightPanel: {
        backgroundColor: '#ecececff',
        width: 150,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    rightIcon: {
        fontSize: 100,
        color: '#ae2573ff'
    },
    rightContent: {
        color: '#3c0c27ff',
        fontSize: 16
    }, 
    title: {
        color: "#ae2573ff",
        fontSize: 32,
        margin: 24,
        textAlign: 'left'
    },
})