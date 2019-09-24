import React from 'react';
import {setData} from '@holusion/react-native-holusion/lib/actions';
import { connect} from 'react-redux';

import { Container, Toast, Content, Footer, Spinner, Text, View, Button, Icon} from 'native-base';
import { StyleSheet, TouchableOpacity, ImageBackground, Animated} from 'react-native';

import {files, selectors} from "@holusion/react-native-holusion";
const {getActiveProduct} = selectors;
const {filename} = files;
import Buttons from "../components/Buttons";

import Cube from "../components/Cube";
import SpriteCube from "../components/SpriteCube";

class GroupViewScreen extends React.Component {
    render() {
        console.warn("id : ", this.props.navigation.getParam("id"), "data : ", this.props.data);
        const source = ((this.props.data && this.props.data.image)?{uri: this.props.data.image}: require("../../assets/missing-image.png"));
        return (
            <Container style={{flex: 1}}>
                <ImageBackground source={source} style={{width: '100%', height: '100%'}} >
                    <Buttons items={this.props.data["links"] || []} onPress={(id)=>this.props.navigation.navigate("GroupView", {id})}/>
                    <SpriteCube target={this.props.target}/>
                </ImageBackground>
            </Container>
        )
    }
    onFocus(){
        if(this.props.config&& this.props.config.video && this.props.target){
            fetch(`http://${this.props.target.url}/control/current/${filename(this.props.data.video)}`, {method: 'PUT'})
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
    constructor(props) {
        super(props);
    }
}


export default connect(function(state, props){
    const {data} = state;
    return {
        config: data.config,
        data: data.items[props.navigation.getParam("id")] || {},
        target: getActiveProduct(state)
    }
})(GroupViewScreen);