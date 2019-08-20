import React from 'react'
import { Text, Row, StyleProvider, Icon } from 'native-base';
import getTheme from '../../native-base-theme/components';

import { assetManager, network, IconButton, IconPushButton } from '@holusion/react-native-holusion'
import { View, Image, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';

import Markdown from 'react-native-markdown-renderer'

import * as Config from '../../Config'

import RNFS from 'react-native-fs';

import { store } from '../utils/flux'

import * as actions from '../actions'
import Medallion from '../components/Medallion';

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
                // Log video, timestamp
                network.play(productUrl, `${videoName}.mp4`)
            }).catch(err => {
                store.dispatch(actions.setErrorTask("http_request", err.message));
            })
        }

    }

    //interesting to render more images and logos, need rework
    renderLogo(video) {
        if(video['logo']) {
            let logos = video['logo'];
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

    // Active video, play once 
    renderDetailsButton(video) {
        const buttons = video.details.map(elem => {
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

    renderObjects() {
        const videos = store.getState().objectVideo.videos.map(elem => assetManager.yamlCache[elem]);

        return videos.map((video, index) => {
            let imageUri = `file://${RNFS.DocumentDirectoryPath}/${Config.projectName}/${store.getState().objectVideo.video}.jpg`;
            const short = <Markdown style={markdownContent}>{video.short}</Markdown>
            
            return (
                <Animated.View style={{...styles.mainPanel, transform: [{translateX: this.state.screenPosition}]}}>
                    <ScrollView style={styles.scrollContainer} scrollEventThrottle={16}>
                        <View style={styles.textContent}>
                            <View style={styles.short}>
                                <View style={styles.titleContainer}>
                                    <Text style={styles.catchPhrase}>{video['Titre']}</Text>
                                    <Text style={styles.subTitle}>{video['SousTitre']}</Text>
                                </View>
                                {short}
                                {this.renderDetailsButton(video)}
                            </View>
                            <View style={styles.medallionContainer}>
                                <Medallion imageUri={imageUri} obj={video} references={video.references}/>
                            </View>
                        </View>
                        <View style={styles.content}>
                            <Markdown style={markdownContent}>{video['Texte principal']}</Markdown>
                        </View>
                    </ScrollView>
                </Animated.View>
            )
        })
    }

    render() {
        const controller = [<IconPushButton type="Ionicons" name="pause" />];
        if(store.getState().objectVideo.videos.length > 1) {
            controller.unshift(<IconButton type="Ionicons" name="skip-backward" onPress={this._onPrevious} />);
            controller.push(<IconButton type="Ionicons" name="skip-forward" onPress={this._onNext} />);
        }

        return (
            <View style={{flex: 1}}>
                <StyleProvider style={Object.assign(getTheme(), customTheme)}>
                    <View style={{flex: 1}}>
                        <View style={styles.screens}>
                            {this.renderObjects()}
                        </View>
                        <View style={styles.controller}>
                            <View style={styles.controllerContent}>
                                {controller}
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
        this.previous = true;
        store.dispatch(actions.previousVideo(store.getState().objectVideo.videos))
    }

    constructor(props, context) {
        super(props, context);

        this.state = {
            screenPosition: new Animated.Value(store.getState().objectVideo.index * -screenWidth),
        }

        this._onNext = this._onNext.bind(this);
        this._onPrevious = this._onPrevious.bind(this);

        if(this.props.navigation.getParam("url")) {
            this.props.navigation.setParams({'color': 'green'})
        }

        this.props.navigation.addListener('didFocus', () => {
            this.unsubscribe = store.subscribe(() => {
                Animated.timing(this.state.screenPosition, {
                    toValue: store.getState().objectVideo.index * -screenWidth,
                    duration: 500,
                }).start();
                this.launchVideo(store.getState().objectVideo.video);
            })
            this.launchVideo(store.getState().objectVideo.video);
        })


        this.props.navigation.addListener('willBlur', (payload) => this.unsubscribe());
    }
}

const screenWidth = Math.round(Dimensions.get('window').width);

const styles = StyleSheet.create({
    controller: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: '#dddddd',
        bottom: 16,
        width: 75 * 3 + 32,
        height: 75 + 32,
        left: (screenWidth - 75 * 3 + 32) / 2,
        position: "absolute",
    },
    controllerContent: {
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainPanel: {
        width: "100%",
    },
    content: {
        fontSize: 24,
        paddingLeft: 24,
        paddingRight: 24,
        marginBottom: 150
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
        marginTop: 16,
        borderRadius: 24,
        flexDirection: 'row',
        shadowColor: "#000", 
        shadowOffset: {
            width: 1, 
            height: 2
        }, 
        shadowOpacity: 0.4, 
        shadowRadius: 5,
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
    },
    screens: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        flex: 1,
    }
})

const markdownContent = StyleSheet.create({
    text: {
        color: Config.textColor,
        fontSize: 24,
        textAlign: "justify"
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
            borderColor: "#bbbbbb",
            borderWidth: 1
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
    },
    'holusion.IconPushButton': {
        button: {borderColor: Config.primaryColor},
    }
}