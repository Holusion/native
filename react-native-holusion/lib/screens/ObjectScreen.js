'use strict'
import React from 'react'
import { Container, Content, Footer, Body, Header, H1, H2, View, Text, Row, Icon, Toast, Button, Spinner } from 'native-base';

import { Image, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';

import Markdown from '../components/Markdown'

import PropTypes from "prop-types";

import {connect} from "react-redux";
import {getActiveItems} from "../selectors";

import Controller from "../components/Controller"

import {filename} from "../files";

import Carousel from 'react-native-looped-carousel';


const {width, height} = Dimensions.get('window');


function ObjectView(d){
    if(!d.active){
        return(<Content contentContainerStyle={styles.content}>
            <H1 style={styles.title}>{d['title']}</H1>
            <H2  style={styles.subTitle}>{d['subtitle']}</H2>
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}><Spinner primary/></View>
        </Content>)
    }

    return(<Content contentContainerStyle={styles.content}>
        <View style={{flexDirection:"row"}}>
            <View style={styles.titleContainer}>
                <H1 primary style={styles.title}>{d['title']}</H1>
                <H2 style={styles.subTitle}>{d['subtitle']}</H2>
                <Markdown style={{text:{fontSize:26}}}>{d['abstract']}</Markdown>
            </View>
            <View style={styles.cartouche}>
                <Image source={{uri: `${d["thumb"]}`}} style={styles.image}/>
                <Markdown >{d['description']}</Markdown>
            </View>
        </View>
        <View style={styles.textContent}>
            <H2 style={styles.subTitle}>Plus d'informations</H2>
            <Markdown>
                {d['mainText']}
            </Markdown>
        </View>
    </Content>)
}


/**
 * Object screen is the screen that render a carousel of the current collection. You can swipe to change the current object or touch the next or previous button
 */
class ObjectScreen extends React.Component {
    get index(){
        return this.props.items.findIndex((item)=> item.id == this.props.navigation.getParam("id"));
    }

    render() {
        const current_index = this.index;
        
        if(!this.props.items || current_index == -1){
            return(<Container>
                <Content contentContainerStyle={styles.content}>
                    <Text>No data for Id : {this.props.navigation.getParam("id")}</Text>
                    <Text>Available objects : {this.props.items.map(i=> i.id).join(", ")}</Text>
                </Content>
            </Container>)
        }
        //When there is more than a few object, we rapidly run into perf limitations
        const active_indices = [
            current_index, 
            ((current_index==0)?this.props.items.length-1: current_index-1),
            ((current_index== this.props.items.length-1)?0: current_index+1)
        ]
        const slides = this.props.items.map((object, index)=>{
            return (<ObjectView {...object} key={object.id} active={active_indices.indexOf(index) !== -1}/>);
        })
        return (<Container onLayout={this._onLayoutDidChange}>
            <Carousel 
                ref={(ref) => this._carousel = ref}
                style={this.state.size}
                currentPage={current_index}
                onAnimateNextPage={(p)=>{
                    if(p != this.index) this.onNextPage(p);
                }}
                autoplay={false}
            >
                {slides}
            </Carousel>
            <Footer style={styles.footer}>
                <Controller multi={1 < this.props.items.length} target={this.props.target} prev={()=>this._carousel._animatePreviousPage()} next={()=>this._carousel._animateNextPage()}/>
            </Footer>
        </Container>)
    }

    onNextPage(index){
        index = (typeof index !== "undefined")? index : this.index;
        const object = this.props.items[index];
        if(!object){
            return console.warn("Object not found at index : ", index);
        }
        this.props.navigation.setParams({id: object.id});

        if(!this.props.target){
            return;
        }
        if(!object){
            console.warn("Index", index, "did not map to any object");
            return;
        }
        //console.warn(`onNextPage(${index}) : ${object.title}`);
        if(this.props.target){
            fetch(`http://${this.props.target.url}/control/current/${filename(object.video)}`, {method: 'PUT'})
            .then(r=>{
                if(!r.ok){
                    Toast.show({
                        text: "Failed to set current : "+r.status,
                        duration: 2000
                    })
                }
            })
        }
    }
    _onLayoutDidChange = (e) => {
        const layout = e.nativeEvent.layout;
        this.setState({ size: { width: layout.width, height: layout.height } });
    }
    constructor(props, context) {
        super(props, context);
        this.state = {
            size: {width, height}
        }
    }
    componentDidMount(){
        this.subscriptions = [
            this.props.navigation.addListener("willFocus",()=>{
                console.warn("willFocus");
                this.onNextPage(this.state.index);
            }),
        ];

    }
    componentWillUnmount(){
        for(let sub of this.subscriptions){
            sub.remove();
        }
    }
}

function mapStateToProps(state, {navigation}){
    const {data, products} = state;
    const items = getActiveItems(state, {selectedCategory: navigation.getParam("category")});
    return {
        items,
        target: products.find(p => p.active)
    };
}

const styles = StyleSheet.create({
    content: {
        marginHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 100,
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
        paddingTop : 0,
        padding: 12,
        borderWidth : 1,
        borderColor : "#bbbbbb"
    },
    propStyle:{
        paddingVertical:5,
    },
    title: {
        lineHeight: 40,
    },
    subTitle: {
        color: "#bbbbbb",
        fontStyle: "italic",
        paddingTop: 12,
    },
    shortDescription:{
        paddingTop:15,
        textAlign: 'justify',
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
        color: "white",
        marginLeft: 8
    },
    footer:{
        position:"absolute",
        bottom:15,
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth:0,
        borderColor: 'transparent',
    },
    
})

export default connect(mapStateToProps)(ObjectScreen);