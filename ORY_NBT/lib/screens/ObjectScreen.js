'use strict'
import React from 'react'
import { Container, Content, Footer, Body, Header, H1, H2, View, Text, Row, Icon, Toast, Button, Spinner } from 'native-base';

import { StyleSheet, Dimensions } from 'react-native';


import PropTypes from "prop-types";

import {connect} from "react-redux";
import {getActiveItems} from "@holusion/react-native-holusion/lib/selectors";


import {filename} from "@holusion/cache-control";
import { Layout } from '../Layout';
import Markdown from '@holusion/react-native-holusion/lib/components/Markdown';


const {width, height} = Dimensions.get('window');

/**
 * Object screen is the screen that render a carousel of the current collection. You can swipe to change the current object or touch the next or previous button
 */
class ObjectScreen extends React.Component {
    get index(){
        return Array.isArray(this.props.items)?this.props.items.findIndex((item)=> (item.id == this.props.route.params["id"])) : -1;
    }

    render() {
      const current_index = this.index;
      let item = this.props.items[current_index];
      let items = this.props.items.map(i=>({
        name: i.title,
        to: i.id,
        active: i.id === item.id
      }))
      if(!item){
        return <View>
          <H2>Object not found</H2>
          <Text>No data for Id : {this.props.route.params["id"]}</Text>
        </View>
      }
      console.warn("Object : ", item);
      let with_description = item["description"]? true : false;
      return <Layout 
        image={item.image}
        navigate={id=>this.props.navigation.navigate("Object", {id, category:item.category})}
        links={items}
        title={item.title}
        subtitle={item.subtitle}
        background={with_description?require("../../assets/background_partie.png"): undefined}
      >
        {with_description && <Container style={styles.container} >
          <Content contentContainerStyle={{paddingBottom:200, paddingHorizontal: 4, paddingTop: 10}}>
            <Markdown style={{
              heading1:{
                fontSize: 24,
                fontFamily: "DaxOT-Bold",
                color: "#5A5099FF"
              },
              heading2: {
                fontSize: 18,
                color: "#9b8fc9FF"
              },
              text: {
                fontFamily: "DaxOT-Regular",
                fontSize: 15
              }
            }}>{item['description']}</Markdown>
          </Content>
        </Container>}
      </Layout>
        
    }

    constructor(props, context) {
        super(props, context);
    }

}

function mapStateToProps(state, {route}){
    const {data, products} = state;
    const items = getActiveItems(state, {selectedCategory: route.params["category"]});
    return {
        items,
        control_buttons: data.slides_control,
        target: products.find(p => p.active)
    };
}

const styles = StyleSheet.create({
container: {
  backgroundColor:"transparent", 
  paddingLeft: 4,
}
})
const ObjectScreenConnected = connect(mapStateToProps)(ObjectScreen);
export function objectScreenWithView(ViewComponent){
    return function ObjectScreenWithView(props){
        return (<ObjectScreenConnected component={ViewComponent} {...props}/>);
    }
}
export default ObjectScreenConnected;