import React from 'react'
import { Text, Row, StyleProvider, Icon } from 'native-base';
import getTheme from '../../native-base-theme/components';

import { assetManager, network, IconButton, IconPushButton } from '@holusion/react-native-holusion'
import { View, Image, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import Carousel from 'react-native-looped-carousel'

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
                <TouchableOpacity style={[styles.detailContainer, {backgroundColor: Config.remoteConfig.primaryColor}]}>
                    <View style={[styles.detailIcon, {backgroundColor: Config.remoteConfig.textColor}]}>
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

    renderObject(video) {
        let imageUri = `file://${RNFS.DocumentDirectoryPath}/${Config.projectName}/${store.getState().objectVideo.video}.jpg`;
        const short = <Markdown style={{text: {
            color: Config.remoteConfig.textColor,
            fontSize: 24,
            textAlign: "justify"
        }}}>
            {video.short}
        </Markdown>
        
        return (
            <ScrollView style={styles.scrollContainer} scrollEventThrottle={16}>
                <View style={styles.textContent}>
                    <View style={styles.short}>
                        <View style={styles.titleContainer}>
                            <Text style={[styles.catchPhrase, {color: Config.remoteConfig.primaryColor}]}>{video['Titre']}</Text>
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
                    <Markdown style={{text: {
                        color: Config.remoteConfig.textColor,
                        fontSize: 24,
                        textAlign: "justify"
                    }}}>
                        {video['Texte principal']}
                    </Markdown>
                </View>
            </ScrollView>
        )
    }

    renderObjects() {
        const videos = store.getState().objectVideo.videos.map(elem => assetManager.yamlCache[elem]);

        return videos.map(video => this.renderObject(video));
    }

    onLayoutDidChange = (e) => {
        const layout = e.nativeEvent.layout;
        this.setState(() => ({size: {width: layout.width, height: layout.height}}))
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
                    <View style={{flex: 1}} onLayout={this.onLayoutDidChange}>
                        <Carousel ref={ref => this.carousel = ref} style={[{flex: 1, width: this.state.size.width}]} autoplay={false} currentPage={store.getState().objectVideo.index} onAnimateNextPage={this.changeVideo}>
                            {this.renderObjects()}
                        </Carousel>
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
        this.carousel._animateNextPage();
        store.dispatch(actions.nextVideo(store.getState().objectVideo.videos))
    }

    _onPrevious() {
        this.carousel._animatePreviousPage();
        store.dispatch(actions.previousVideo(store.getState().objectVideo.videos))
    }

    changeVideo = (p) => {
        store.dispatch(actions.setVideo(store.getState().objectVideo.videos, p))
    }

    constructor(props, context) {
        super(props, context);
        this.state = {
            size: {width, height}
        }

        customTheme['holusion.ButtonInOutComponent'].icon.color = Config.remoteConfig.primaryColor;
        customTheme['holusion.ClickPanelComponent'].icon.color = Config.remoteConfig.primaryColor;
        customTheme['holusion.ClickPanelComponent'].content.color = Config.remoteConfig.secondaryColor;
        customTheme['holusion.IconButton'].icon.color = Config.remoteConfig.secondaryColor;
        customTheme['holusion.IconPushButton'].button.borderColor = Config.remoteConfig.primaryColor;

        this._onNext = this._onNext.bind(this);
        this._onPrevious = this._onPrevious.bind(this);

        if(this.props.navigation.getParam("url")) {
            this.props.navigation.setParams({'color': 'green'})
        }

        this.props.navigation.addListener('didFocus', () => {
            this.unsubscribe = store.subscribe(() => {
                this.launchVideo(store.getState().objectVideo.video);
            })
            this.launchVideo(store.getState().objectVideo.video);
        })


        this.props.navigation.addListener('willBlur', (payload) => this.unsubscribe());
    }
}

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
    controller: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: '#dddddd',
        bottom: 16,
        width: 75 * 3 + 32,
        height: 75 + 32,
        left: (width - 75 * 3 + 32) / 2,
        position: "absolute",
    },
    controllerContent: {
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainPanel: {
        
    },
    content: {
        fontSize: 24,
        paddingLeft: 24,
        paddingRight: 24,
        marginBottom: 150
    },
    bottomButton: {
        backgroundColor: Config.remoteConfig.primaryColor,
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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    detailText: {
        fontSize: 24,
        color: "white",
        marginLeft: 8
    },
})

const customTheme = {
    'holusion.ButtonInOutComponent': {
        icon: {
            color: Config.remoteConfig.primaryColor
        }
    },
    'holusion.ClickPanelComponent': {
        icon: {
            color: Config.remoteConfig.primaryColor
        },
        content: {
            color: Config.remoteConfig.secondaryColor
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
            color: Config.remoteConfig.secondaryColor
        }
    },
    'holusion.IconPushButton': {
        button: {borderColor: Config.remoteConfig.primaryColor},
    }
}