'use strict'
import React from 'react'
import { Container, Content, Footer, Body, Header, H1, H2, View, Text, Row, Icon, Toast, Button, Spinner } from 'native-base';

import { StyleSheet, Dimensions } from 'react-native';


import PropTypes from "prop-types";

import {connect} from "react-redux";
import {getActiveItems} from "../selectors";

import Controller from "../components/Controller"

import {filename} from "@holusion/cache-control";

import Carousel from 'react-native-looped-carousel';


const {width, height} = Dimensions.get('window');


import ObjectView from "../components/ObjectView";
import WikiView from "../components/WikiView";
import { VideoPlayer } from '../sync/VideoPlayer';

/**
 * Object screen is the screen that render a carousel of the current collection. You can swipe to change the current object or touch the next or previous button
 */

class ObjectScreen extends React.Component {
    get index(){
        return Array.isArray(this.props.items)?this.props.items.findIndex((item)=> (item.id == this.props.route.params["id"])) : -1;
    }
    static propTypes = {
        views: PropTypes.object
    }
    static defaultProps = {
        views: {
            "Base": ObjectView,
            "Wiki": WikiView,
        }
    }
    render() {
        const current_index = this.index;
        
        if(!this.props.items || current_index == -1){
            return(<Container>
                <Content contentContainerStyle={styles.content}>
                    <Text>No data for Id : {this.props.route.params["id"]}</Text>
                    <Text>Available objects : { (Array.isArray(this.props.items) && 0 < this.props.items.length)? this.props.items.map(i=> i.id).join(", ") : "None"}</Text>
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
            let layout = object.layout || "Base";
            let View_component = this.props.views[layout];
            if(!View_component){
                Toast.show({
                    severity: "warning",
                    duration: 5000,
                    text: `No view provided for layout ${layout}`
                })
                View_component = this.props.views["Base"];
            }
            return (<View_component key={object.id} active={active_indices.indexOf(index) !== -1} navigation={this.props.navigation} {...object} />);
        })

        return (<Container onLayout={this._onLayoutDidChange}>
            <VideoPlayer/>
            <Carousel 
                ref={(ref) => this._carousel = ref}
                style={this.state.size}
                currentPage={current_index}
                onAnimateNextPage={(p)=>{
                    if(p != this.index) this.onNextPage(p);
                }}
                swipe={["default", "swipe"].indexOf(this.props.control_buttons) != -1}
                autoplay={false}
            >
                {slides}
            </Carousel>
            <Footer style={styles.footer}>
                {["default", "buttons"].indexOf(this.props.control_buttons) != -1 && <Controller multi={1 < this.props.items.length} target={this.props.target} prev={()=>this._carousel._animatePreviousPage()} next={()=>this._carousel._animateNextPage()}/>}
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
        if(this.props.target && object.video){
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
            this.props.navigation.addListener("focus",()=>{
                this.onNextPage(this.state.index);
            }),
        ];
    }
    componentWillUnmount(){
        for(let sub of this.subscriptions){
            sub();
        }
    }
}

function mapStateToProps(state, {route}){
    const {conf, products} = state;
    const items = getActiveItems(state, {selectedCategory: route.params["category"]});
    return {
        items,
        control_buttons: conf.slides_control,
        target: products.find(p => p.active)
    };
}

const styles = StyleSheet.create({
    content: {
        marginHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 100,
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
const ObjectScreenConnected = connect(mapStateToProps)(ObjectScreen);

export function objectScreenWithViews(views){
    return function ObjectScreenWithViews(props){
        return (<ObjectScreenConnected views={views} {...props}/>);
    }
}
export default ObjectScreenConnected;