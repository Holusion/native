'use strict'
import React from 'react'

import { StyleSheet, Dimensions, View } from 'react-native';


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
        const canSwipe = ["swipe","default"].indexOf(this.props.control_buttons)!== -1 ;
        
        return (<View onLayout={this._onLayoutDidChange}>
            <VideoPlayer/>
            <ObjectList 
                ref= {(ref)=>this._list = ref}
                initialItem={this.props.index}
                items={this.props.items}
                size={this.state.size}
                views={this.props.views}
                onChange={ canSwipe ? this.setIdForIndex: null}
            />
            <View style={styles.footer} pointerEvents="box-none">
                <Controller 
                    prev={this.props.index !== 0? this.onPrevPage : null} 
                    next={(this.props.index < this.props.items.length -1 )?this.onNextPage : null}
                />
            </View>
        </View>)
    }

    onNextPage = ()=>{
        this.setIdForIndex(this.props.index+1)
    }
    onPrevPage = ()=>{
        this.setIdForIndex(this.props.index-1)
    }
    componentDidMount(){
      this.props.navigation.setOptions({title: this.props.item.header || this.props.route.name})
    }
    componentDidUpdate(prevProps){
      if(prevProps.id !== this.props.id){
        this.props.navigation.setOptions({title: this.props.item.header || this.props.route.name})
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
  const selectedCategory = route.name === "Undefined"? undefined : route.name;
  const items = getItems(state);
  const activeItems = getActiveItems(state, {selectedCategory});
  const id = route.params? route.params.id : activeItems[0].id;
  const item = items[id];
  const index = Array.isArray(activeItems)? activeItems.findIndex((item)=> (item.id == id)) : -1;

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
        bottom:100,
        width:"100%",
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth:0,
        borderColor: 'transparent',
    },
    
})
const ObjectScreenConnected = connect(mapStateToProps)(ObjectScreen);

export default ObjectScreenConnected;

export function objectScreenWithViews(views){
    return function ObjectScreenWithViews(props){
        return (<ObjectScreenConnected views={views} {...props}/>);
    }
}