import React from 'react'
import { Footer, FooterTab, Text, Button, Container, Body, Icon, Grid, Col, Row, StyleProvider } from 'native-base';
import getTheme from '../../native-base-theme/components';

import YAMLObjectComponent from '../components/YAMLObjectComponent';
import { assetManager, network } from '@holusion/react-native-holusion'
import { Modal, StyleSheet, View, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';

import {FlingGestureHandler, Directions, State} from 'react-native-gesture-handler'
import Markdown from 'react-native-markdown-renderer'


import RNFS from 'react-native-fs';

export default class ObjectScreen extends React.Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerRight: <Icon style={{marginRight: 16, color: navigation.getParam('color', 'red')}} name="ios-wifi"/>
        }
    }

    activeModal(number) {
        this.setState({modalVisible: number})
    }

    launchVideo(videoName) {
        if(network.getUrl()) {
            let productUrl = network.getUrl();
    
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
            let refs = Object.keys(this.obj).filter(elem => {
                return !elem.includes("Texte", 0) && elem != "logo" && this.obj[elem];
            })
            display = refs.map((s, index) => {
                if(this.obj && this.obj[s]) {
                    return <Text style={styles.modalText} key={index}><Text style={{fontWeight: 'bold', color: '#3c0c27ff', fontSize: 24}}>{s}</Text>: {this.obj[s]}</Text>
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

    generateComplButton() {
        let compls = [];
        if(this.obj) {
            compls = Object.keys(this.obj).filter(elem => elem.indexOf('compl') == 6); //#startsWith made something strange :/
        }

        return (
            <View style={{display: 'flex', flexDirection: "column", justifyContent: 'center'}}>
                <Button key={0} onPress={() => this.activeModal(0)} style={{backgroundColor: '#ae2573ff', margin: 4, marginBottom: 16, alignSelf: 'center', width: 225, justifyContent: 'center'}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>Référence de l'objet</Text>
                </Button>
            {
                compls.map((element, index) => {
                    const elemSplit = element.split(' ');
                    let number = parseInt(elemSplit[elemSplit.length - 1]);
                    return <Button key={index} onPress={() => this.activeModal(number)} style={{backgroundColor: '#ae2573ff', margin: 4, marginBottom: 16, alignSelf: 'center', width: 225, justifyContent: 'center'}}>
                        <Text style={{fontSize: 18, fontWeight: 'bold'}}>Info complémentaire {number}</Text>
                    </Button>
                })
            }
            </View>
        )
    }

    generateFooter() {

        return (
            <FooterTab>
                <Button onPress={() => this.props.navigation.push('End', {objList: this.props.navigation.getParam('objList')})}>
                    <Text>Remerciements</Text>
                </Button>
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

    renderLogo() {
        if(this.obj['logo']) {
            let logos = this.obj['logo'];
            let display = [];
            let row = [];
            for(let i = 0; i < logos.length; i++) {
                row.push(
                    <Col key={i}>
                        <Image key={i} source={{uri: `file://${RNFS.DocumentDirectoryPath}/${logos[i]}`, scale: 1}} style={{width:100, height:100, marginTop: 8, resizeMode: 'contain', alignSelf: "center"}}/>
                    </Col>
                )
                if(i % 3 == 0 && i != 0) {
                    display.push(
                        <Row key={display.length}>
                            {row}
                        </Row>
                    )
                    row = [];
                }
            }

            if(row.length > 0) {
                display.push(
                    <Row key={display.length}>
                        {row}
                    </Row>
                )
            }

            return <Grid style={{margin: 8}}>
                {display}
            </Grid>
        }
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

        let txt = <View>
            <YAMLObjectComponent style={styles.content} data={this.obj}/>
            {this.generateComplButton()}
        </View>

        if(this.props.navigation.getParam('type') == "catalogue") {
            txt = <View>
                {
                    Object.keys(this.obj).filter(elem => {
                        return !elem.includes("Texte", 0) && elem != "logo" && this.obj[elem];
                    }).map((s, index) => {
                        if(this.obj && this.obj[s]) {
                            let txt = `__${s}__: ${this.obj[s]}`
                            return <Markdown style={markdownText}>{txt}</Markdown>
                        }
                        return null;
                    })
                }
            </View>
        }

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
                                    <Markdown style={markdownTitle}>{this.obj['Titre']}</Markdown>
                                    {/* <Text style={styles.title}>{this.obj['Titre']}</Text> */}
                                </Row>
                                <Row size={5} style={styles.mainPanel}>
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
                                    <ScrollView style= {{marginTop: 16}} ref={(scroller) => this.scroller = scroller}>
                                        <View style={{height: this.screenHeight}}>
                                            <Image source={{uri: `${imageUri}`, scale: 1}} style={{width:400, height:400, marginTop: 8, resizeMode: 'contain', alignSelf: "center"}}/>
                                            <TouchableOpacity onPress={this.scrollToText} style={{alignSelf: 'center'}}>
                                                <Icon name='ios-arrow-dropdown-circle' style={{fontSize: 75, color: '#ae2573ff'}} />
                                            </TouchableOpacity>
                                        </View>
                                        <View>
                                            <TouchableOpacity onPress={this.scrollToImage} style={{alignSelf: 'center'}}>
                                                <Icon name='ios-arrow-dropup-circle' style={{fontSize: 75, color: '#ae2573ff'}}/>
                                            </TouchableOpacity>
                                            {txt}
                                            {this.renderLogo()}
                                        </View>
                                    </ScrollView>
                                    </FlingGestureHandler>
                                </FlingGestureHandler>
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
        let index = (this.state.currentVideoIndex + 1) % this.props.navigation.getParam('objList').length
        let nextVideo = this.props.navigation.getParam('objList')[index];
        this.obj = assetManager.yamlCache[nextVideo];
        this.launchVideo(nextVideo);
        this.setState({currentVideoIndex: index});
        this.scrollToImage()
    }

    _onPrevious() {
        let index = this.state.currentVideoIndex <= 0 ? this.props.navigation.getParam('objList').length - 1 : this.state.currentVideoIndex - 1;
        
        let previousVideo = this.props.navigation.getParam('objList')[index];
        this.obj = assetManager.yamlCache[previousVideo];
        this.launchVideo(previousVideo);
        this.setState({currentVideoIndex: index});
        this.scrollToImage();
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

        this.screenHeight = Dimensions.get('window').height * (4/5);

        this._onNext = this._onNext.bind(this);
        this._onPrevious = this._onPrevious.bind(this);

        if(network.getUrl()) {
            this.props.navigation.setParams({'color': 'green'})
        }
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
        color: '#3c0c27ff',
        marginLeft: 32,
        marginRight: 32,
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
        color: '#ae2573ff'
    },
    rightContent: {
        color: '#3c0c27ff',
        fontSize: 16
    }, 
    title: {
        color: "#ae2573ff",
        fontSize: 28,
        margin: 12,
        textAlign: 'left'
    },
    footer: {

    }
})

const markdownTitle = StyleSheet.create({
    text: {
        color: "#ae2573ff",
        fontSize: 26,
        margin: 12,
        textAlign: 'left',
    }
})

const markdownText = StyleSheet.create({
    text: {
        textAlign: 'left',
        color: '#3c0c27ff',
        marginLeft: 32,
        marginRight: 32,
        fontSize: 24
    }
})