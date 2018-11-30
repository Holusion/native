import React from 'react'
import { Content, Footer, FooterTab, Text, Button, Container, Body, Icon, Grid, Col, Row, StyleProvider } from 'native-base';
import getTheme from '../../native-base-theme/components';

import YAMLObjectComponent from '../components/YAMLObjectComponent';
import { assetManager, network } from '@holusion/react-native-holusion';
import * as zeroconfManager from '../utils/zeroconfManager';
import { Modal, StyleSheet, View, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';

import RNFS from 'react-native-fs';

import { FlingGestureHandler, State, Directions } from "react-native-gesture-handler";

export default class ObjectScreen extends React.Component {
    activeModal(number) {
        this.setState({modalVisible: number})
    }

    launchVideo(videoName) {
        let productUrl = zeroconfManager.getUrl();

        if(productUrl) {
            network.desactiveAll(productUrl).then(elem => {
                network.active(productUrl, `${videoName}.mp4`)
            }).then(_ => {
                network.play(productUrl, `${videoName}.mp4`)
            }).catch(err => {
                console.error(err);
            })
        }


    }

    renderModal(number) {
        let display = null;
        if(number === 0) {
            display = Object.keys(this.obj).filter(elem => elem.indexOf('Texte') != 0 && elem != 'color' && elem != 'Theme' && elem != "Collections" && elem != "loop").map((s, index) => {
                if(this.obj && this.obj[s]) {
                    return <Text style={styles.modalText} key={index}>{s}: {this.obj[s]}</Text>
                }
                return null;
            })
            if(display.length == 0) {
                display = <Text style={styles.modalText}>Aucune référence pour cet objet</Text>
            }
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

    scrollToText = () => {
        let scrollYPos = this.screenHeight * 1;
        this.scroller.scrollTo({x: 0, y: scrollYPos})
    }

    scrollToImage = () => {
        this.scroller.scrollTo({x: 0, y: 0});
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
                        <Row size={5} style={styles.mainPanel}>
                            <StyleProvider style={getTheme()}>
                        <FlingGestureHandler
                                direction={Directions.RIGHT}
                                onHandlerStateChange={({ nativeEvent }) => {
                                    if (nativeEvent.state === State.ACTIVE) {
                                        this._onPrevious();
                                    }
                                }}>
                                    <FlingGestureHandler 
                                    direction={Directions.LEFT}
                                    onHandlerStateChange={({ nativeEvent }) => {
                                        if (nativeEvent.state === State.ACTIVE) {
                                            this._onNext();
                                        }
                                    }}>
                                <ScrollView style= {{marginTop: 16, flex: 1}} ref={(scroller) => this.scroller = scroller}>
                                    <View style={{height: this.screenHeight}}>
                                        <Image source={{uri: `${imageUri}`, scale: 1}} style={{resizeMode: 'contain', width:400, height:400, marginTop: 8, marginBottom: 8, alignSelf: "center"}}/>
                                        <TouchableOpacity onPress={this.scrollToText} style={{alignSelf: 'center'}}>
                                            <Icon name='ios-arrow-dropdown-circle' style={{fontSize: 75, color: '#005797ff'}} />
                                        </TouchableOpacity>
                                    </View>
                                    <View>
                                        <TouchableOpacity onPress={this.scrollToImage} style={{alignSelf: 'center'}}>
                                            <Icon name='ios-arrow-dropup-circle' style={{fontSize: 75, color: '#005797ff'}} />        
                                        </TouchableOpacity>
                                        <YAMLObjectComponent style={styles.content} data={this.obj}/>
                                    </View>
                                </ScrollView>
                            </FlingGestureHandler>
                            </FlingGestureHandler>
                            </StyleProvider>
                        </Row>
                    </Col>
                    <Col style={styles.rightPanel} onPress={this._onNext}>
                        <Icon name="ios-arrow-forward" style={styles.rightIcon} />
                        <Text style={styles.rightContent}>Objet suivant</Text>
                    </Col>
                </Grid>
                <StyleProvider style={getTheme()}>
                    <Footer style={styles.footer}>
                        {this.generateFooter()}
                    </Footer>
                </StyleProvider>
            </Container>
        )
    }

    _onNext() {
        this.scrollToImage();

        if(this.state.currentVideoIndex + 1 >= this.props.navigation.getParam('objList').length) {
            if(zeroconfManager.getUrl()) network.desactiveAll(this.props.navigation.getParam('url'));
            this.props.navigation.push('End');
        } else {
            let nextVideo = this.props.navigation.getParam('objList')[this.state.currentVideoIndex + 1];
            this.obj = assetManager.yamlCache[nextVideo];
            this.launchVideo(nextVideo);
            this.setState({currentVideoIndex: this.state.currentVideoIndex + 1});
        }
    }

    _onPrevious() {
        this.scrollToImage();

        if(this.state.currentVideoIndex <= 0) {
            return;
        } else {
            let previousVideo = this.props.navigation.getParam('objList')[this.state.currentVideoIndex - 1];
            this.obj = assetManager.yamlCache[previousVideo];
            this.launchVideo(previousVideo);
            this.setState({currentVideoIndex: this.state.currentVideoIndex - 1});
        }
    }

    constructor(props, context) {
        super(props, context);
        let currentObj = this.props.navigation.getParam('objList')[this.props.navigation.getParam('objId')];
        this.obj = assetManager.yamlCache[currentObj]

        this.state = {
            modalVisible: -1,
            currentVideoIndex: this.props.navigation.getParam('objId')
        }
        this.complLength = 0;
        this.complLength = Object.keys(this.obj).filter(elem => elem.indexOf('compl') == 6).length;

        this.launchVideo(currentObj);

        this.screenHeight = Dimensions.get('window').height * 4/5;

        this._onNext = this._onNext.bind(this);
        this._onPrevious = this._onPrevious.bind(this);
    }
}

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
        color: '#00334cff',
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
        color: "#00334cff",
        fontSize: 24,
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
        color: '#005797ff'
    },
    rightContent: {
        color: '#00334cff',
        fontSize: 16
    }, 
    title: {
        color: "#005797ff",
        fontSize: 28,
        margin: 12,
        textAlign: 'left'
    }
})