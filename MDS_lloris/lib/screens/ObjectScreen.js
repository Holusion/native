'use strict'
import React from 'react'
import { Container, Content, Footer, Body, Header, Title, H2, View, Text, Row, Icon, Toast, Button, Spinner, List, ListItem } from 'native-base';

import { StyleSheet, Dimensions, ImageBackground } from 'react-native';

import UserInactivity from 'react-native-user-inactivity';

import PropTypes from "prop-types";

import {connect} from "react-redux";

import {filename} from "@holusion/react-native-holusion/lib/files";
import {setData} from '@holusion/react-native-holusion/lib/actions';
import {getActiveItems} from "@holusion/react-native-holusion/lib/selectors";

const {width, height} = Dimensions.get('window');
function LinksView(props){
    let links;
    function navigateTo(id){
        //console.warn("Navigate to : ", id);
        props.navigation.navigate("Question", {id});
    }
    if(!props.active){
        links = (<Spinner primary/>)
    }else{
        links = (<List noIndent itemDivider={false}>{props.links.map((link, index)=>{
            const bgColor = (index %2 == 0)? "#034EA2FF" : "#57C1D7FF";
            return (<ListItem noBorder style={{ padding: 0, margin: 0, height: 84, borderWidth:0, justifyItems: "stretch", flexDirection:"row"}} key={index} onPress={()=>navigateTo(link['name'])}>
                <View style={{backgroundColor: bgColor, height:80, width: 40}}></View>
                <View style={{backgroundColor:"#43484b68",  height:80, flex: 1, padding: 5, justifyContent: "center"}}><Text style={{ color: "white", lineHeight: 30, fontSize: 28}}>{link['title']}</Text></View>
            </ListItem>)
        })}</List>)
    }

    return(<React.Fragment>
         <View style={styles.titleContainer}>
                <Title style={styles.title}>{props['title'].toUpperCase()}</Title>
        </View>
        <Content contentContainerStyle={styles.links}>
            {links}
        </Content>
    </React.Fragment>)
}

/**
 * Object screen is the screen that render a carousel of the current collection. You can swipe to change the current object or touch the next or previous button
 */
class ObjectScreen extends React.Component {
    get index(){
        return Array.isArray(this.props.items)?this.props.items.findIndex((item)=> item.id == this.props.navigation.getParam("id")) : -1;
    }
    get item(){
        return (this.index != -1)? this.props.items[this.index]: null;
    }
    onInactive(){
        if(this.props.navigation.isFocused()){
            this.props.navigation.navigate("Home");
        }
    }
    render() {
        const current_index = this.index;
        
        if(!this.props.items || current_index == -1){
            return(<Container>
                <Content contentContainerStyle={styles.content}>
                    <Text>No data for Id : {this.props.navigation.getParam("id")}</Text>
                    <Text>Available objects : { (Array.isArray(this.props.items) && 0 < this.props.items.length)? this.props.items.map(i=> i.id).join(", ") : "None"}</Text>
                </Content>
            </Container>)
        }
        
        return (<UserInactivity timeForInactivity={40000} onAction={()=>this.onInactive()}>
            <Container onLayout={this._onLayoutDidChange}>
                <ImageBackground source={require('../../assets/02_Background.png')} style={{width: "100%", height: "100%", resizeMode: "contain"}} >
                    <LinksView {...this.item} navigation={this.props.navigation} active/>
                </ImageBackground>
            </Container>
        </UserInactivity>)
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
        const willFocusSubscribe = this.props.navigation.addListener("willFocus", ()=>{
            this.onFocus();
        });
        const willBlurSubscribe = this.props.navigation.addListener("willBlur", ()=>{
            if(this.abortController) this.abortController.abort();
        });

        this.unsubscribe = () => {
            willFocusSubscribe.remove();
            willBlurSubscribe.remove();
        }
    }

    componentWillUnmount(){
        this.unsubscribe();
        if(this.abortController) this.abortController.abort();
    }
    onFocus(){
        if(this.abortController) this.abortController.abort();
        this.abortController = new AbortController();        
        if(this.item && this.item.video && this.props.target){
            fetch(`http://${this.props.target.url}/control/current/${filename(this.item.video)}`, {method: 'PUT', signal: this.abortController.signal})
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
    titleContainer: {
        position: "absolute",
        zIndex: 100,
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'stretch',
        backgroundColor: "black",
        alignContent: 'center',
        lineHeight: 68,
        paddingTop: 10
    },
    links:{
        flex:1,
        paddingTop : 80,
        paddingRight:0,
        paddingLeft: 0,
        margin: 0,
    },
    title: {
        backgroundColor: "black",
        zIndex: 100,
        flex: 1,
        lineHeight: 68,
        fontSize: 30,
        marginTop: -8,
        fontWeight: "bold",
        alignSelf: "center",
        color: "white",
        fontFamily: "Oswald",
    },
})

const ObjectScreenConnected = connect(mapStateToProps)(ObjectScreen);
export function objectScreenVithView(ViewComponent){
    return function ObjectScreenWithView(props){
        return (<ObjectScreenConnected component={ViewComponent} {...props}/>);
    }
}
export default ObjectScreenConnected;