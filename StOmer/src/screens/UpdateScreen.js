'use strict';
import React from 'react';
import {setData} from "../actions";
import { connect} from 'react-redux'

import { Container, StyleProvider, Toast, ListItem, Icon, Footer, Button, Content, Text, Spinner} from 'native-base';
import { StyleSheet, View, TouchableOpacity, FlatList} from 'react-native';

import {getFiles} from "../utils/loadFile";

class UpdateScreen extends React.Component {
    render() {
        if(!this.props.isConnected){
            return(<Container  style={styles.container}>
                <Content contentContainerStyle={styles.content}>
                    <Text>Device is not connected to the internet</Text>
                    <Text>Please check your wifi or wired connection</Text>
                    <Button primary onPress={()=>{this.props.navigation.goBack()}} style={{marginTop:20}}><Text> Back </Text></Button>               
                </Content>
            </Container>)
        }
        let statusIcon;
        switch(this.state.status){
            case "loading":
                statusIcon = <Spinner/>
                break;
            case "error":
                statusIcon = <Icon name="ios-bug"/>;
                break;
            case "idle":
            default:
                statusIcon = <Icon primary name="ios-paper-plane"/>;
        }
        return (
            <Container>
                <Content contentContainerStyle={styles.content}>
                    {statusIcon}
                    <Text>{this.state.statusText}</Text>
                    <Button primary onPress={()=>this.props.navigation.navigate("Home")}><Text>Home</Text></Button>
                </Content>
            </Container>
        )
    }
    componentDidMount(){
        this.setState({status: "loading", statusText: "Fetching Data"});
        getFiles({onProgress:(current)=>{
            this.setState({statusText: current});
        }}).then(({data, errors})=>{
            if(errors.length == 0){
                setData(data);
                return this.setState({status: "idle", statusText:"Updated data to latest version"});
            }else{
                console.warn("There was errors : ", errors);
                return this.setState({status: "error", statusText: errors.join("\n")})
            }
        },(err)=>{
            this.setState({status: "error", statusText: err});
        })
    }
    constructor(props) {
        super(props);
        this.state = {status: "loading", statusText: "initializing", error: null};
    }
}

const styles = StyleSheet.create({
    container: {
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

function mapStateToProps(state){
    const {products, network} = state;
    return {isConnected: network.status == "online"};
}
export default connect(mapStateToProps, {setData})(UpdateScreen);