import React from 'react'
import { Footer, FooterTab, Text, Button, Container, Body, Grid, Col, Row, StyleProvider } from 'native-base';
import getTheme from '../../native-base-theme/components';

import YAMLObjectComponent from '../components/YAMLObjectComponent';
import { assetManager, network } from '@holusion/react-native-holusion'
import { Modal, StyleSheet, View, Image, ScrollView, Dimensions, findNodeHandle } from 'react-native';

import {FlingGestureHandler, Directions, State} from 'react-native-gesture-handler'
import Markdown from 'react-native-markdown-renderer'

import * as Config from '../../Config'

import RNFS from 'react-native-fs';
import VideoComponent from '../components/VideoComponent';

import { store } from '../utils/flux'
import { SelectionType } from '../actions'

import {navigator} from '../../navigator'
import * as strings from '../../strings'

import * as actions from '../actions'
import ClickPanelComponent from '../components/ClickPanelComponent';
import ButtonInOutComponent from '../components/ButtonInOutComponent';

/**
 * Object screen is the screen that render the selected object. We can change object to click on left or right panel. Changing object has effect to send multiple request to
 * the controller (on the connected product). It will deactivate all file and activate the current video associated to the object.
 * It manage the modal renderering when footer button are clicked too
 */
export default class ObjectScreen extends React.Component {

    activeModal(number) {
        this.setState({modalVisible: number})
    }

    launchVideo(videoName) {
        if(this.props.navigation.getParam("url")) {
            let productUrl = this.props.navigation.getParam("url");
    
            network.desactiveAll(productUrl).then(elem => {
                network.active(productUrl, `${videoName}.mp4`)
            }).then(_ => {
                network.play(productUrl, `${videoName}.mp4`)
            }).catch(err => {
                store.dispatch(actions.setErrorTask("http_request", err.message));
            })
        }

    }

    renderModal(number) {
        let display = null;
        if(number === 0) {
            let refs = Object.keys(this.state.obj).filter(elem => {
                return !elem.includes("Texte", 0) && elem != "logo" && this.state.obj[elem];
            })
            display = refs.map((s, index) => {
                if(this.state.obj && this.state.obj[s]) {
                    let txt = `__${s}__: ${this.state.obj[s]}`
                    return <Markdown style={markdownText} key={index}>{txt}</Markdown>
                }
                return null;
            })
        } else if(number > 0) {
            let text = "";
            if(this.state.obj) {
                text = this.state.obj[`Texte complémentaire ${number}`];
            }
            display = <Markdown style={markdownText}>{text}</Markdown>
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

    renderComplButton() {
        let compls = [];
        if(this.state.obj) {
            compls = Object.keys(this.state.obj).filter(elem => elem.indexOf('compl') == 6); //#startsWith made something strange :/
        }

        return (
            <View style={{display: 'flex', flexDirection: "column", justifyContent: 'center'}}>
                <Button key={0} onPress={() => this.activeModal(0)} style={{backgroundColor: Config.primaryColor, margin: 4, marginBottom: 16, alignSelf: 'center', width: 225, justifyContent: 'center'}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>Référence de l'objet</Text>
                </Button>
            {
                compls.map((element, index) => {
                    const elemSplit = element.split(' ');
                    let number = parseInt(elemSplit[elemSplit.length - 1]);
                    return <Button key={index} onPress={() => this.activeModal(number)} style={{backgroundColor: Config.primaryColor, margin: 4, marginBottom: 16, alignSelf: 'center', width: 225, justifyContent: 'center'}}>
                        <Text style={{fontSize: 18, fontWeight: 'bold'}}>Info complémentaire {number}</Text>
                    </Button>
                })
            }
            </View>
        )
    }

    renderFooter() {
        return (
            <Footer>
                <FooterTab>
                    <Button onPress={() => this.props.navigation.push(navigator.objectRemerciements.id, {objList: this.store.getState().objectVideo.videos})}>
                        <Text>Remerciements</Text>
                    </Button>
                </FooterTab>
            </Footer>
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
        if(this.state.obj['logo']) {
            let logos = this.state.obj['logo'];
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
        if(this.buttonRef) {
            this.buttonRef.refs.innerView.measureLayout(findNodeHandle(this.scroller), (x, y) => {
                this.scroller.scrollTo({x: 0, y: y})
            })
        }
    }

    scrollToImage = () => {
        if(this.scroller) {
            this.imageRef.measureLayout(findNodeHandle(this.scroller), (x, y) => {
                this.scroller.scrollTo({x: 0, y: y});
            })
            this.buttonRef.setState(() => ({in: true}))
        }
    }

    render() {
        let allModals = this.generateAllModal();
        let imageUri = `file://${RNFS.DocumentDirectoryPath}/${store.getState().objectVideo.video}.jpg`;
        let illustration = <Image ref={component => this.imageRef = component} source={{uri: `${imageUri}`, scale: 1}} style={{width:400, height:400, marginTop: 8, marginBottom: 32, resizeMode: 'contain', alignSelf: "center"}}/>
        if(Config.isStingray) {
            let videoUri = `file://${RNFS.DocumentDirectoryPath}/${store.getState().objectVideo.video}.mp4`
            illustration = <VideoComponent uri={`${videoUri}`} style={{width:400, height:400, marginTop: 8, alignSelf: "center"}}/>
        }

        let txt = <View>
            <YAMLObjectComponent style={markdownContent} data={this.state.obj}/>
            {this.renderComplButton()}
        </View>

        if(store.getState().selectionType == SelectionType.CATALOGUE) {
            txt = <View>
                {
                    Object.keys(this.state.obj).filter(elem => {
                        return !elem.includes("Texte", 0) && elem != "logo" && this.state.obj[elem];
                    }).map((s, index) => {
                        if(this.state.obj && this.state.obj[s]) {
                            let txt = `__${s}__: ${this.state.obj[s]}`
                            return <Markdown key={index} style={markdownText}>{txt}</Markdown>
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
                    <ClickPanelComponent onPress={this._onPrevious} content={strings.object.previous_object} icon="ios-arrow-back" />
                    <Col>
                        <Row size={1}>
                            <Markdown style={markdownTitle}>{this.state.obj['Titre']}</Markdown>
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
                                        <View>
                                            { illustration }
                                            <ButtonInOutComponent ref={(component) => this.buttonRef = component} iconIn='ios-arrow-dropdown-circle' iconOut='ios-arrow-dropup-circle' onPressIn={this.scrollToText} onPressOut={this.scrollToImage} />
                                        </View>
                                        <View>
                                            {txt}
                                            {this.renderLogo()}
                                        </View>
                                    </ScrollView>
                                </FlingGestureHandler>
                            </FlingGestureHandler>
                        </Row>
                    </Col>
                    <ClickPanelComponent onPress={this._onNext} content={strings.object.next_object} icon="ios-arrow-forward" />
                </Grid>

                <StyleProvider style={getTheme()}>
                    {this.renderFooter()}
                </StyleProvider>
            </Container>
        )
    }

    _onNext() {
        store.dispatch(actions.nextVideo(store.getState().objectVideo.videos))
    }

    _onPrevious() {
        store.dispatch(actions.previousVideo(store.getState().objectVideo.videos))
    }

    constructor(props, context) {
        super(props, context);

        this.state = {
            modalVisible: -1,
            currentVideoIndex: store.getState().objectVideo.index,
            obj: assetManager.yamlCache[store.getState().objectVideo.video]
        }

        this.screenHeight = Dimensions.get('window').height * (4/5);

        this._onNext = this._onNext.bind(this);
        this._onPrevious = this._onPrevious.bind(this);

        if(this.props.navigation.getParam("url")) {
            this.props.navigation.setParams({'color': 'green'})
        }

        this.props.navigation.addListener('didFocus', () => {
            this.unsubscribe = store.subscribe(() => {
                this.setState(() => ({currentVideoIndex: store.getState().objectVideo.index, obj: assetManager.yamlCache[store.getState().objectVideo.video]}));
                this.launchVideo(store.getState().objectVideo.video);
                this.scrollToImage();
            })
        })


        this.props.navigation.addListener('willBlur', (payload) => this.unsubscribe());
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
        color: Config.secondaryColor,
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
        color: Config.secondaryColor,
        fontSize: 24,
        padding: 24
    },
    mainPanel: {
        display: 'flex',
        alignItems: "center",
        justifyContent: 'center'

    },
    title: {
        color: Config.primaryColor,
        fontSize: 28,
        margin: 12,
        textAlign: 'left'
    },
})

const markdownContent = StyleSheet.create({
    text: {
        color: Config.secondaryColor,
        fontSize: 24,
        padding: 24
    }
})

const markdownTitle = StyleSheet.create({
    text: {
        color: Config.primaryColor,
        fontSize: 26,
        margin: 12,
        textAlign: 'left',
    }
})

const markdownText = StyleSheet.create({
    text: {
        textAlign: 'left',
        color: Config.secondaryColor,
        marginLeft: 32,
        marginRight: 32,
        fontSize: 24
    }
})