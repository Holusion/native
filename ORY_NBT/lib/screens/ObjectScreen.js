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
      let items = this.props.items.map(item=>({
        name: item.title,
        to: item.id
      }))
      if(!item){
        return <View>
          <H2>Object not found</H2>
          <Text>No data for Id : {this.props.route.params["id"]}</Text>
        </View>
      }
      console.warn("Object : ", item);
      return <Layout 
        image={item.image}
        navigate={id=>this.props.navigation.navigate("Object", {id, category:item.category})}
        links={items}
        title={item.title}
        background={require("../../assets/background_partie.png")}
      >
        <Container style={styles.container}>
          <Content >
            <Markdown style={{
              heading1:{
                fontSize: 22,
                color: "#5A5099FF"
              },
              heading2: {
                fontSize: 18,
                color: "#9b8fc9FF"
              },
              text: {
                fontSize: 15
              }
            }}>{item['description']}</Markdown>
          </Content>
        </Container>
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