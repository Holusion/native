import React from 'react'
import { Text, Row, StyleProvider, Icon } from 'native-base';
import getTheme from '../../native-base-theme/components';

import { assetManager, network, IconButton, IconPushButton } from '@holusion/react-native-holusion'
import { View, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

import Markdown from 'react-native-markdown-renderer'

import * as Config from '../../Config'

import RNFS from 'react-native-fs';

import { store } from '../utils/flux'

import {navigator} from '../../navigator'

import * as actions from '../actions'
import Medallion from '../components/Medallion';
import { whileStatement } from '@babel/types';

/**
 * Object screen is the screen that render the selected object. We can change object to click on left or right panel. Changing object has effect to send multiple request to
 * the controller (on the connected product). It will deactivate all file and activate the current video associated to the object.
 * It manage the modal renderering when footer button are clicked too
 */
export default class ObjectScreen extends React.Component {

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

    renderLogo() {
        if(this.state.obj['logo']) {
            let logos = this.state.obj['logo'];
            let display = [];
            let row = [];
            for(let i = 0; i < logos.length; i++) {
                row.push(
                    <View key={i}>
                        <Image key={i} source={{uri: `file://${RNFS.DocumentDirectoryPath}/${Config.projectName}/${logos[i]}`, scale: 1}} style={styles.logo}/>
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

    renderDetailsButton() {
        const buttons = this.state.obj.details.map(elem => {
            return (
                <TouchableOpacity style={styles.detailContainer}>
                    <View style={styles.detailIcon}>
                        <Icon type={"Ionicons"} style={{color: "white", fontSize: 24}} name={"play"} />
                    </View>
                    <Text style={styles.detailText}>{elem.titre}</Text>
                </TouchableOpacity>
            )
        })

        return (
            <View>
                {buttons}
            </View>
        )
    }

    render() {
        let imageUri = `file://${RNFS.DocumentDirectoryPath}/${Config.projectName}/${store.getState().objectVideo.video}.jpg`;
        const short = <Markdown style={markdownContent}>{this.state.obj.short}</Markdown>

        return (
            <View style={{flex: 1}}>
                <StyleProvider style={Object.assign(getTheme(), customTheme)}>
                    <View style={{flex: 1}}>
                        <View style={styles.mainPanel}>
                            <ScrollView style={styles.scrollContainer} scrollEventThrottle={16}>
                                <View style={styles.textContent}>
                                    <View style={styles.short}>
                                        <View style={styles.titleContainer}>
                                            <Text style={styles.catchPhrase}>{this.state.obj['Titre']}</Text>
                                            <Text style={styles.subTitle}>{this.state.obj['SousTitre']}</Text>
                                        </View>
                                        {short}
                                        {this.renderDetailsButton()}
                                    </View>
                                    <View style={styles.medallionContainer}>
                                        <Medallion imageUri={imageUri} obj={this.state.obj} references={this.state.obj.references}/>
                                    </View>
                                </View>
                            </ScrollView>
                            <View style={styles.controller}>
                                <View style={styles.controllerContent}>
                                    <IconButton type="Ionicons" name="skip-backward" onPress={this._onPrevious} />
                                    <IconPushButton type="Ionicons" name="pause" />
                                    <IconButton type="Ionicons" name="skip-forward" onPress={this._onNext} />
                                </View>
                            </View>
                        </View>
                    </View>
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
            currentVideoIndex: store.getState().objectVideo.index,
            obj: assetManager.yamlCache[store.getState().objectVideo.video],
        }

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
    controller: {
        position: 'absolute',
        bottom: 16,
        width: "100%",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: '#dddddd',
    },
    controllerContent: {
        display: 'flex', 
        flexDirection: 'row',
        padding: 24,
        backgroundColor: Config.primaryColor,
        borderRadius: 50,
    },
    mainPanel: {
        flex: 1,
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
        width: "33%"
    },
    catchPhrase: {
        color: Config.primaryColor,
        fontSize: 32,
        textAlign: 'left'
    },
    short: {
        width: "66%",
        paddingRight: 24
    },
    textContent: {
        margin: 24,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    titleContainer: {
        paddingBottom: 24
    },
    subTitle: {
        color: "#bbbbbb",
        fontSize: 24,
        fontStyle: "italic"
    },
    detailContainer: {
        backgroundColor: Config.primaryColor,
        padding: 8,
        width: "100%",
        display: "flex",
        marginBottom: 16,
        borderRadius: 24,
        flexDirection: 'row'
    },
    detailIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Config.textColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    detailText: {
        fontSize: 24,
        color: "white",
        marginLeft: 8
    }
})

const markdownContent = StyleSheet.create({
    text: {
        color: Config.textColor,
        fontSize: 24,
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