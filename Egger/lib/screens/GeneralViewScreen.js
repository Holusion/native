import React from 'react';
import {setData} from '@holusion/react-native-holusion/lib/actions';
import { connect} from 'react-redux';

import { Container, Toast, Content, Footer, Spinner, Text, View, Button, Icon} from 'native-base';
import { StyleSheet, TouchableOpacity, ImageBackground} from 'react-native';

import {selectors, files} from "@holusion/react-native-holusion";
const {getActiveProduct} = selectors;
const {filename} = files;
import Buttons from "../components/Buttons";

class GeneralViewScreen extends React.Component {
    render() {
        if(!this.props.data){
            return (<Container style={{flex:1, alignItems: "center", alignContent: "center"}}><Spinner/></Container>)
        }
        return (
            <Container style={{flex: 1}}>
                <ImageBackground source={{uri: this.props.data.image}} style={{width: '100%', height: '100%'}} >
                    <Buttons items={this.props.data["links"]} onPress={(id)=>{
                        console.warn("Navigate to group id : ", id);
                        this.props.navigation.navigate("GroupView", {id})
                        }}/>
                </ImageBackground>
            </Container>
        )
    }
    onFocus(){
        if(this.props.config&& this.props.config.video && this.props.target){
            fetch(`http://${this.props.target.url}/control/current/${filename(this.props.config.video)}`, {method: 'PUT'})
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
    componentDidMount(){
        this.subscription = this.props.navigation.addListener("willFocus",()=>{
            this.onFocus();
        })
    }
    componentWillunmount(){
        this.subscription.remove();
    }
    constructor(props) {
        super(props);
    }
}


export default connect(function(state, props){
    const {data} = state;
    return {
        config: data.config,
        data: data.items["general"],
        target: getActiveProduct(state)
    }
})(GeneralViewScreen);