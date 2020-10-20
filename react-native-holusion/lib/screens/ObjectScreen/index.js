'use strict'
import React from 'react'
import { Container, Content, Footer, Text } from 'native-base';

import { StyleSheet, Dimensions } from 'react-native';


import PropTypes from "prop-types";

import {connect} from "react-redux";
import {getActiveItems} from "../../selectors";

import {Controller} from "../../containers"


const {width, height} = Dimensions.get('window');


import { VideoPlayer } from '../../sync/VideoPlayer';

import ObjectList from "./ObjectList"

/**
 * Object screen is the screen that render a FlatList of the current collection. 
 * You can swipe to change the current object or touch the next or previous button (depending on configured controls)
 */

class ObjectScreen extends React.Component {
    get index(){
        return Array.isArray(this.props.items)?this.props.items.findIndex((item)=> (item.id == this.props.route.params["id"])) : -1;
    }
    static propTypes = {
        views: PropTypes.object
    }
    setIdForIndex = (i)=>{
        const object = this.props.items[i];
        if(!object){
            return console.warn("Object not found at index : ", i);
        }
        this.props.navigation.setParams({id: object.id});
    }
    render() {
        const initialItem = this.index;
        if(!this.props.items || initialItem == -1){
            return (<Container testID="object-not-found">
                <Content contentContainerStyle={styles.content}>
                    <Text>No data for Id : {this.props.route.params["id"]}</Text>
                    <Text>Available objects : { (Array.isArray(this.props.items) && 0 < this.props.items.length)? this.props.items.map(i=> i.id).join(", ") : "None"}</Text>
                </Content>
            </Container>)
        }
        
        return (<Container onLayout={this._onLayoutDidChange}>
            <VideoPlayer/>
            <ObjectList 
                ref= {(ref)=>this._list = ref}
                initialItem={this.index}
                items={this.props.items}
                size={this.state.size}
                views={this.props.views}
                onChange={this.setIdForIndex}
            />
            <Footer style={styles.footer}>
                <Controller 
                    prev={this.index !== 0? this.onPrevPage : null} 
                    next={(this.index < this.props.items.length -1 )?this.onNextPage : null}
                />
            </Footer>
        </Container>)
    }
    onNextPage = ()=>{
        this.onChangePage((this.index + 1), true);
    }
    onPrevPage = ()=>{
        this.onChangePage(this.index - 1, true);
    }
    onChangePage(index, animated=false){
        if(this._list){
            this._list.scrollToIndex({animated, index});
        }
    }
    _onLayoutDidChange = (e) => {
        const layout = e.nativeEvent.layout;
        this.setState({ size: { width: layout.width, height: layout.height } });
    }
    constructor(props, context) {
        super(props, context);
        this.state = {
            size: {width, height},
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