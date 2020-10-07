import React from 'react';
import {setData} from '@holusion/react-native-holusion/lib/actions';
import { connect} from 'react-redux';



import { Container, Toast, Content, Footer, Spinner, Text, View, Button, Icon, H1, H2} from 'native-base';
import { StyleSheet, TouchableOpacity, ImageBackground, Animated} from 'react-native';

import {files, selectors, components} from "@holusion/react-native-holusion";
const {getActiveProduct} = selectors;
const {filename} = files;
const {Markdown} = components;
import Buttons from "../components/Buttons";


import {theme} from "../../theme";

class GroupViewScreen extends React.Component {
    render() {
        //console.warn("id : ", this.props.navigation.getParam("id"), "data : ", this.props.data);
        if(this.props.data["description"]){
            return this.renderDescription();
        }else{
            return this.renderFullWidth();
        }
    }
    renderDescription(){
        const source = ((this.props.data && this.props.data.image)?{uri: this.props.data.image}: require("../../assets/missing-image.png"));

        return(<Container style={{flex:1, display:"flex", flexDirection:"row"}}>
            <View style={styles.imageWithDescription}>
                <ImageBackground resizeMode= 'contain' source={source} style={{width: '100%', height: '100%'}} >
                    <H1 primary style={styles.title}>{this.props.data["title"]}</H1>
                    <H2 secondary style={styles.subtitle}>{this.props.data["subtitle"]}</H2>
                    <Buttons items={this.props.data["links"] || []} onPress={(id)=>this.props.navigation.push("GroupView", {id})}/>
                </ImageBackground>
            </View>
            <Content contentContainerStyle={styles.contentWithDescription}>
                <View style={styles.contentView}>
                    <Markdown style={styles.markdown}>{this.props.data['description']}</Markdown>
                </View>
                
            </Content>
        </Container>)
    }
    renderFullWidth(){
        const source = ((this.props.data && this.props.data.image)?{uri: this.props.data.image}: require("../../assets/missing-image.png"));
        return (
            <Container style={{flex: 1}}>
                <ImageBackground source={source} style={{width: '100%', height: '100%'}} >
                    <H1 primary style={styles.title}>{this.props.data["title"]}</H1>
                    <H2 secondary style={styles.subtitle}>{this.props.data["subtitle"]}</H2>
                    <Buttons items={this.props.data["links"] || []} onPress={(id)=>this.props.navigation.push("GroupView", {id})}/>
                </ImageBackground>
            </Container>
        )
    }
    onFocus(){
        if(this.abortController) this.abortController.abort();
        this.abortController = new AbortController();
        if(this.props.config&& this.props.data.video && this.props.target){
            fetch(`http://${this.props.target.url}/control/current/${filename(this.props.data.video)}`, {method: 'PUT', signal: this.abortController.signal})
            .then(r=>{
                if(!r.ok){
                    Toast.show({
                        text: "Failed to set current : "+r.status,
                        duration: 2000
                    })
                }
            })
        }else if(!this.props.data.video){
            console.warn(`WARNING : node ${this.props.data.id} has no video`)
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
        if(this.abortController) this.abortController.abort();
        this.unsubscribe();
    }
    constructor(props) {
        super(props);
    }
}

const styles = StyleSheet.create({
    imageWithDescription:{
        flex: 2,
    },
    contentWithDescription:{
    },
    contentView:{
        flex: 1,
        zIndex: 1,
        padding: 10,
        paddingBottom: 80,
        backgroundColor: "#f1f1f1",
        minHeight:"100%",
    },
    title:{
        paddingTop: 30,
        paddingLeft: 10,
        width:"100%",
    },
    subtitle:{
        paddingLeft: 10,

    },
})

export default connect(function(state, props){
    const {data} = state;
    return {
        config: data.config,
        data: data.items[props.navigation.getParam("id")] || {},
        target: getActiveProduct(state)
    }
})(GroupViewScreen);