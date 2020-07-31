'use strict';
import React from 'react';
import {setData} from "../actions";
import { connect} from 'react-redux'

import { Container, StyleProvider, Toast, ListItem, Icon, Footer, Button, Content, Text, Spinner, View} from 'native-base';
import { StyleSheet, TouchableOpacity, FlatList} from 'react-native';

import {getFiles, FileError} from "@holusion/cache-control";
import StatusIcon from "../components/StatusIcon";

class UpdateScreen extends React.Component {
    render() {
        if(!this.props.isConnected){
            return(<Container  style={styles.container}>
                <Content contentContainerStyle={styles.content}>
                    <Text>{this.props.navigation.getParam("error")}</Text>
                    <Text>Device is not connected to the internet</Text>
                    <Text>Please check your wifi or wired connection</Text>
                    <Button primary onPress={()=>{this.props.navigation.goBack()}} style={{marginTop:20}}><Text> Back </Text></Button>               
                </Content>
            </Container>)
        }
        return (
            <Container>
                <Content contentContainerStyle={styles.content}>
                    <Text>{this.props.navigation.getParam("error")}</Text>
                    <StatusIcon status={this.state.status}/>
                    <Text>{this.state.statusText}</Text>
                    <Button primary onPress={()=>this.props.navigation.navigate("Home")}><Text>Home</Text></Button>
                </Content>
            </Container>
        )
    }
    componentDidMount(){
        this.abortController = new AbortController();
        this.setState({status: "loading", statusText: "Fetching Data"});
        getFiles({
            projectName: this.props.projectName,
            signal: this.abortController.signal,
            onProgress:(current)=>{
                this.setState({statusText: current});
            },
            force: this.props.navigation.getParam("error")? true:false,
        }).then((data)=>{
            if(data.aborted) return;
            console.warn("SetData : ", data);
            this.props.setData(data);
            return this.setState({status: "idle", statusText:"Updated data to latest version"});
        }).catch((err)=>{
            console.warn("getFiles Error : ", err.message, err.sourceFile);
            if(err instanceof FileError){
                this.setState({status: "error", statusText: `Error on ${err.sourceFile} : ${err.message}`});
            }else{
                this.setState({status: "error", statusText: `Failed to update: ${err.toString()}`});
            }
            
        })
    }
    componentWillUnmount(){
        if(this.abortController) this.abortController.abort();
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
    const {products, network, data} = state;
    return {isConnected: network.status == "online", projectName: data.projectName};
}
export default connect(mapStateToProps, {setData})(UpdateScreen);