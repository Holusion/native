'use strict'
import React from 'react'
import { Container, Content, Footer, H1, Text } from 'native-base';

import { StyleSheet, Dimensions } from 'react-native';


import PropTypes from "prop-types";

import {connect} from "react-redux";
import {getActiveItems} from "../../selectors";

import {Controller} from "../../containers"


const {width, height} = Dimensions.get('window');


import { VideoPlayer } from '../../sync/VideoPlayer';

import ObjectList from "./ObjectList"
import { getItems } from '@holusion/cache-control';

/**
 * Object screen is the screen that render a FlatList of the current collection. 
 * You can swipe to change the current object or touch the next or previous button (depending on configured controls)
 * It does some sort of strange circular update between itself, holding the route param and ObjectList which holds the VirtualizedList
 * it *works* but should be improved
 */

class ObjectScreen extends React.Component {

    static propTypes = {
        views: PropTypes.object
    }
    setIdForIndex = (i)=>{
        const object = this.props.items[i];
        if(object.id === this.props.id) return;
        if(!object){
            return console.warn("Object not found at index : ", i);
        }
        this.props.navigation.setParams({id: object.id});
    }
    render() {
        if(!this.props.items || this.props.index == -1){
            return (<Container testID="object-not-found">
                <Content contentContainerStyle={styles["404Content"]}>
                  <H1 style={{paddingTop: 8}}>Erreur : non trouvé</H1>
                  <Text>Aucune page n'existe avec l'identifiant "{this.props.route.params["id"]}"</Text>
                  <Text>Les pages existantes sont : { (Array.isArray(this.props.items) && 0 < this.props.items.length)? this.props.items.map(i=> i.id).join(", ") : "None"}</Text>
                </Content>
            </Container>)
        }
        const canSwipe = ["swipe","default"].indexOf(this.props.control_buttons)!== -1 ;
        return (<Container onLayout={this._onLayoutDidChange}>
            <VideoPlayer/>
            <ObjectList 
                ref= {(ref)=>this._list = ref}
                initialItem={this.props.index}
                items={this.props.items}
                size={this.state.size}
                views={this.props.views}
                onChange={ canSwipe ? this.setIdForIndex: null}
            />
            <Footer style={styles.footer}>
                <Controller 
                    prev={this.props.index !== 0? this.onPrevPage : null} 
                    next={(this.props.index < this.props.items.length -1 )?this.onNextPage : null}
                />
            </Footer>
        </Container>)
    }

    onNextPage = ()=>{
        this.setIdForIndex(this.props.index+1)
    }
    onPrevPage = ()=>{
        this.setIdForIndex(this.props.index-1)
    }
    componentDidUpdate(prevProps){
      if(prevProps.id !== this.props.id){
        //Index might not change if we navigate to another ID with the same in-category index
        requestAnimationFrame(()=>{ 
          if(this._list){
            this._list.scrollToIndex({
              animated: Math.abs(this.props.index-prevProps.index) === 1, 
              index: this.props.index
            });
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
            size: {width, height},
        }
    }
}

function mapStateToProps(state, {route}){
    const {conf, products} = state;
    const id = route.params["id"];
    const items = getItems(state);
    const item = items[id];
    const selectedCategory = item?item.category: undefined;
    const activeItems = getActiveItems(state, {selectedCategory});
    const index = Array.isArray(activeItems)?activeItems.findIndex((item)=> (item.id == id)) : -1
    //console.log("ID : ", item.id, "Index : ", index, activeItems.map(i=>i.id));
    return {
        id,
        item,
        index,
        items: activeItems,
        control_buttons: conf.slides_control,
        target: products.find(p => p.active)
    };
}

const styles = StyleSheet.create({
    "404Content": {
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