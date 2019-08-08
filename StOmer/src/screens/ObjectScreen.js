import React from 'react'
import { Footer, FooterTab, Text, Button, Body, Row, StyleProvider } from 'native-base';
import getTheme from '../../native-base-theme/components';

import { assetManager, network, YAMLObjectComponent, IconButton, IconPushButton } from '@holusion/react-native-holusion'
import { Modal, StyleSheet, View, Image, ScrollView, Dimensions } from 'react-native';

import Markdown from 'react-native-markdown-renderer'

import * as Config from '../../Config'

import RNFS from 'react-native-fs';

import { store } from '../utils/flux'

import {navigator} from '../../navigator'

import * as actions from '../actions'
import Medallion from '../components/Medallion';
import { HeaderBackButton } from 'react-navigation';

/**
 * Object screen is the screen that render the selected object. We can change object to click on left or right panel. Changing object has effect to send multiple request to
 * the controller (on the connected product). It will deactivate all file and activate the current video associated to the object.
 * It manage the modal renderering when footer button are clicked too
 */
export default class ObjectScreen extends React.Component {

    static navigationOptions = ({navigation}) => ({
        title: `${navigation.getParam('title')}`,
    })

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
                <ScrollView>
                    {display}
                </ScrollView>
                <View>
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
            <View style={styles.buttonContainer}>
                <Button key={0} onPress={() => this.activeModal(0)} style={styles.bottomButton}>
                    <Text style={styles.bottomButtonText}>Référence de l'objet</Text>
                </Button>
            {
                compls.map((element, index) => {
                    const elemSplit = element.split(' ');
                    let number = parseInt(elemSplit[elemSplit.length - 1]);
                    return <Button key={index} onPress={() => this.activeModal(number)} style={styles.bottomButton}>
                        <Text style={styles.bottomButtonText}>Info complémentaire {number}</Text>
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
                    <Button onPress={() => this.props.navigation.push(navigator.objectRemerciements.id, {objList: store.getState().objectVideo.videos})}>
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
                    <View key={i}>
                        <Image key={i} source={{uri: `file://${RNFS.DocumentDirectoryPath}/${logos[i]}`, scale: 1}} style={styles.logo}/>
                    </View>
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

            return <View style={styles.grid}>
                {display}
            </View>
        }
    }

    render() {
        let allModals = this.generateAllModal();
        let imageUri = `file://${RNFS.DocumentDirectoryPath}/${store.getState().objectVideo.video}.jpg`;

        let txt = <View>
            <YAMLObjectComponent style={markdownContent} data={this.state.obj}/>
            {this.renderComplButton()}
        </View>

        return (
            <View style={{flex: 1}}>
                {allModals}
                <StyleProvider style={Object.assign(getTheme(), customTheme)}>
                    <View style={{flex: 1}}>
                        <View style={styles.topPanel}>
                            <View style={{display: 'flex', flexDirection: 'row'}}>
                                <IconButton type="Ionicons" name="skip-backward" onPress={this._onPrevious} />
                                <IconPushButton type="Ionicons" name="pause" />
                                <IconButton type="Ionicons" name="skip-forward" onPress={this._onNext} />
                            </View>
                            {/* Add interaction controller here */}
                            <View style={styles.medallionContainer}>
                                <Medallion imageUri={imageUri} />
                            </View>
                        </View>
                        <View style={styles.mainPanel}>
                            <ScrollView style={styles.scrollContainer} scrollEventThrottle={16}>
                                <View ref={component => this.txtRef = component}>
                                    {txt}
                                    {this.renderLogo()}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </StyleProvider>

                <StyleProvider style={getTheme()}>
                    {this.renderFooter()}
                </StyleProvider>
            </View>
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
            obj: assetManager.yamlCache[store.getState().objectVideo.video],
            scrollPos: 0
        }

        this.screenHeight = Dimensions.get('window').height * (4/5);

        this._onNext = this._onNext.bind(this);
        this._onPrevious = this._onPrevious.bind(this);

        if(this.props.navigation.getParam("url")) {
            this.props.navigation.setParams({'color': 'green'})
        }

        this.props.navigation.addListener('didFocus', () => {
            this.unsubscribe = store.subscribe(() => {
                this.props.navigation.push(navigator.object.id, {
                    url: this.props.navigation.getParam('url'),
                    title: assetManager.yamlCache[store.getState().objectVideo.video]['Titre']
                });
            })
            this.launchVideo(store.getState().objectVideo.video);
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
    modalText: {
        textAlign: "left",
        color: Config.textColor,
        marginLeft: 32,
        marginRight: 32,
        fontSize: 24
    },
    modalButton: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    topPanel: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: '#dddddd',
        borderBottomWidth: 2,
    },
    mainPanel: {
        flex: 4,
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
    bottomButton: {
        backgroundColor: Config.primaryColor,
        color: "#FFFFFF",
        margin: 4, 
        marginBottom: 16, 
        alignSelf: 'center', 
        width: 225, 
        justifyContent: 'center'
    },
    bottomButtonText: {
        fontSize: 18, 
        fontWeight: 'bold'
    },
    logo: {
        width:100, 
        height:100, 
        marginTop: 8, 
        resizeMode: 'contain', 
        alignSelf: "center"
    },
    buttonContainer: {
        display: 'flex', 
        flexDirection: "column", 
        justifyContent: 'center'
    },
    medallionContainer: {
        position: "absolute",
        left: 0,
    }
})

const markdownContent = StyleSheet.create({
    text: {
        color: Config.textColor,
        fontSize: 24,
        padding: 24
    }
})

const markdownText = StyleSheet.create({
    text: {
        textAlign: 'left',
        color: Config.textColor,
        marginLeft: 16,
        marginRight: 16,
        fontSize: 32
    }
})

const customTheme = {
    'holusion.ButtonInOutComponent': {
        icon: {
            color: Config.primaryColor
        }
    },
    'holusion.ClickPanelComponent': {
        icon: {
            color: Config.primaryColor
        },
        content: {
            color: Config.secondaryColor
        }
    },
    'holusion.Medallion': {
        container: {
            borderColor: "#fff"
        }
    },
    'holusion.IconButton': {
        button: {
            marginLeft: 8,
            marginRight: 8,
            shadowRadius: 0,
            shadowOffset: {
                width: 0, 
                height: 0
            },
            backgroundColor: null
        },
        icon: {
            color: Config.secondaryColor
        }
    }
}