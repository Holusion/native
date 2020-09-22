'use strict';
import React from 'react';
import { connect} from 'react-redux'


import { Container, Button, Content, Text} from 'native-base';
import { StyleSheet } from 'react-native';

import StatusIcon from "../components/StatusIcon";

import {sendFiles} from "@holusion/cache-control";

class SynchronizeScreen extends React.Component {
    render() {
        if(!this.state.status =="loading"){
            return (<Container>
                <Content contentContainerStyle={styles.content}>
                    <StatusIcon status={this.state.status}/>
                    <Text>{this.state.statusText}</Text>
                    <Button onPress={this.send}><Text>Synchroniser</Text></Button>
                </Content>
            </Container>)
        }
        return (<Container>
            <Content contentContainerStyle={styles.content}>
                <StatusIcon status={this.state.status}/>
                <Text>{this.state.statusText}</Text>
            </Content>
        </Container>)
    }

    constructor(props) {
        super(props);
        this.state = {status: "idle", statusText: ""}

    }

    componentDidMount(){
        this.send();
    }

    componentWillUnmount(){
        if(typeof this.abort === "function") this.abort();
    }

    send(){
        if(this.state.status =="loading") return;
        if(!this.props.target){
            return this.setState({status: "error", statusText: "no target product selected"})
        }
        this.setState({status: "loading", statusText: "fetching playlist"});
        const url = `http://${this.props.target.url}`;
        const videos =[ 
            ...Object.keys(this.props.items).map(key=>this.props.items[key].video),
            this.props.config.video,
            ...this.props.config.categories.map(c=>c.video)
        ].filter(i=>i)
       const [abort] = sendFiles({
           target: this.props.target,
           videos,
           onStatusChange:({status, statusText})=> this.setState({status, statusText}),
           purge: this.props.purge,
       });
       this.abort = abort;
    }
}

const styles = StyleSheet.create({
    content:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',

    }
});

function mapStateToProps(state){
    const {products, conf, data} = state;
    return {
      target: products.find(p => p.active == true),
      items: data.items,
      purge: conf.purge_products,
      config: data.config,
    }
}
export default connect(mapStateToProps, {})(SynchronizeScreen);