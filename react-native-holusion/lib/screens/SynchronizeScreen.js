'use strict';
import React from 'react';
import { connect} from 'react-redux'

import RNFS from 'react-native-fs';

import { Container, StyleProvider, Toast, ListItem, Icon, Footer, Button, Content, Text} from 'native-base';
import { StyleSheet, TouchableOpacity, FlatList} from 'react-native';

import StatusIcon from "../components/StatusIcon";

import {filename} from "../files";

class SynchronizeScreen extends React.Component {
    render() {
            
        return (<Container>
            <Content contentContainerStyle={styles.content}>
                <StatusIcon status={this.state.status}/>
                <Text>{this.state.statusText}</Text>
            </Content>
        </Container>)
    }

    constructor(props) {
        super(props);
        if(!props.target){
            this.state = {status: "error", statusText: "no target product selected"}
        }else if(Object.keys(props.items).length == 0){
            this.state = {status: "error", statusText: "no local application data"}
        }else{
            this.state = {status: "loading", statusText:"Synchronizing..."}
        }
        
    }

    componentDidMount(){
        const url = `http://${this.props.target.url}`;
        if(this.state.status == "error") return;
        this.setState({statusText: "fetching playlist"});
        fetch(`${url}/playlist`)
        .then(async r =>{
            const list = await r.json();
            const uploads = [];
            const errors = [];
            if(!r.ok){
                return this.setState({status: "error", statusText: list.message});
            }
            for(const key in this.props.items){
                const item = this.props.items[key];
                if(!item.video) continue;
                const name = filename(item.video);
                const distantFile = list.find((i)=> i.name == name);
                if(!distantFile){
                    uploads.push({
                        uri: `${item.video}`,
                        name: name,
                        type: "video/mp4"
                    })
                }
            }
            if(this.props.config.homeScreen){
                /*
                uploads.push({
                    uri: this.props.config.homeScreen,
                    name: filename(this.props.config.homeScreen),
                    type:"video/mp4"
                }) //*/
            }
            for (const file of uploads){
                this.setState({statusText: "Uploading "+ file.name});
                //It's a bad pattern but react-native's XMLHttpRequest implementation will randomly throw on missing file
                if(!await RNFS.exists(file.uri)){
                    console.warn("File ",file.uri,"does not exists");
                    continue;
                }
                const form = new FormData();
                form.append("file", file);
                try{
                    const response = await fetch(`${url}/medias`, {
                        body: form,
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'multipart/form-data',
                        }
                    });
                    const body = response.json();
                    if (response.ok) {
                        this.setState({statusText:`${file.name} uploaded`})
                    } else {
                        errors.push(body.message)
                    }
                }catch(e){
                    console.warn(e);
                    errors.push(e.toString());
                }
                
                
            }
            if(0 < errors.length){
                return this.setState({status: "error", statusText: errors.join("\n")});
            }
            /*
            const query = this.props.config.homeScreen ? {$not:{name:filename(this.props.config.homeScreen)}} : {};
            const response = await fetch(`${url}/playlist/`, {
                method: "PUT",
                headers:{
                    "Content-Type":"application/json", 
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    query: query,
                    modifier:{
                        $set:{active: false }
                    }
                })
            })
            const body = await response.json();
            if(!response.ok){
                return this.setState({status: "error", statusText: `Failed to deactivate items. Error ${response.status} : ${JSON.stringify(body.message)}`});
            }
            //*/
            this.setState({status: "idle", statusText: "Synchronized!"});
            
        }).catch(e=>{
            this.setState({status: "error", statusText: e.toString()});
        })
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
    const {products, data} = state;
    return {
      target: products.find(p => p.active == true),
      items: data.items,
      config: data.config,
    }
}
export default connect(mapStateToProps, {})(SynchronizeScreen);