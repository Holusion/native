import React from 'react'
import { Container, Content, Footer, Body, Header, H1, H2, View, Text, Row, Icon, Toast } from 'native-base';

import { Image, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';

import Markdown from 'react-native-markdown-renderer'

import {connect} from "react-redux";

import Controller from "../components/Controller"

import {filename} from "../files";

/**
 * Object screen is the screen that render a carousel of the current collection. You can swipe to change the current object or touch the next or previous button
 */
class ObjectScreen extends React.Component {

    render() {
        /*
        <Carousel ref={ref => this.carousel = ref} style={[{flex: 1, width: this.state.size.width}]} autoplay={false} currentPage={store.getState().objectVideo.index} onAnimateNextPage={this.changeVideo}>
            {this.renderObjects()}
        </Carousel>
        //*/
        const d = this.props.data;
        if(!d){
            return(<Container>
                <Content>
                    <Text>No data for Id : {this.props.navigation.getParam("id")}</Text>
                    <Text>Available objects : {Object.keys(this.props.raw_data).join(", ")}</Text>
                </Content>
            </Container>)
        }
        const properties = Object.keys(d['properties']).map((key, idx)=>{
            const value = d['properties'][key];
            return (<View key={idx} style={styles.propStyle}>
                <Text><Text style={{fontWeight:"bold"}}>{key} : </Text>{value}</Text>
            </View>)
        })
        return (
            <Container>
                <Content contentContainerStyle={styles.content}>
                    <View style={{flexDirection:"row"}}>
                        <View style={styles.titleContainer}>
                            <H1 style={styles.title}>{d['title']}</H1>
                            <H2  style={styles.subTitle}>{d['subtitle']}</H2>
                            <Text style={styles.shortDescription}>{d['short']}</Text>
                        </View>
                        <View style={styles.cartouche}>
                            <Image source={{uri: `${d["thumb"]}`}} style={styles.image}/>
                            {properties}
                        </View>
                        
                    </View>
                    <View style={styles.textContent}>
                        <Markdown style={{text: {
                            fontSize: 24,
                            textAlign: "justify"
                        }}}>
                            {d['description']}
                        </Markdown>
                    </View>
                </Content>

                <Footer style={styles.controller}>
                    <Controller />
                </Footer>
            </Container>
        )
    }



    pauseVideo = () => {
        //TODO: should send pause to the controller
    }

    unpauseVideo = () => {
        //TODO: should send unpause to the controller
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
        this.props.navigation.addListener("willFocus",()=>{
            if(this.props.target){
                const name = filename(this.props.data["video"])
                fetch(`http://${this.props.target.url}/control/current/${name}`, {method: 'PUT'})
                .then(r=>{
                    if(!r.ok){
                        Toast.show({
                            text: "Failed to set current : "+r.status,
                            duration: 2000
                        })
                    }
                })
            }
            
        })
        this._onNext = this._onNext.bind(this);
        this._onPrevious = this._onPrevious.bind(this);

    }
}

function mapStateToProps(state, {navigation}){
    const id = navigation.getParam("id");
    const {data, products} = state;
    return {
        data: data.items[id], 
        raw_data: data, 
        target: products.find(p => p.active)
    };
}

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
    content: {
        marginHorizontal: 24
    },
    image: {
        flex: 1,
        minHeight: 150,
        resizeMode: 'contain', 
    },
    textContent: {
        paddingTop: 24,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    titleContainer: {
        flex:2,
    },
    cartouche:{
        flex:1,
        justifyContent: "center",
        marginLeft: 40,
    },
    propStyle:{
        paddingVertical:5,
    },
    title: {
        paddingVertical: 24,
        fontSize: 32
    },
    subTitle: {
        color: "#bbbbbb",
        fontSize: 24,
        fontStyle: "italic",
        paddingVertical: 12
    },
    shortDescription:{
        paddingTop:15,
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
    controller:{
        position:"absolute",
        bottom:15,
        flex:1,
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth:0,
        borderColor: 'transparent',
    }
})

export default connect(mapStateToProps)(ObjectScreen);