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
            let uploads = [];
            const errors = [];
            if(!r.ok){
                return this.setState({status: "error", statusText: list.message});
            }
            for(const key in this.props.items){
                const item = this.props.items[key];
                if(!item.video) continue;
                uploads.push({
                    uri: `${item.video}`,
                    name: filename(item.video),
                    type: "video/mp4"
                })
            }

            if(this.props.config.video){
                uploads.push({
                    uri: this.props.config.video,
                    name: filename(this.props.config.video),
                    type:"video/mp4"
                })
            }

            for (const category of this.props.config.categories){
                if(category.video){
                    uploads.push({
                        uri: category.video,
                        name: filename(category.video),
                        type:"video/mp4"
                    })
                }
            }
            //Remove existing files
            uploads = uploads.filter((file, index)=>{
                if(list.find((i) => i.name == file.name)){
                    return false;
                }else if(uploads.findIndex((i)=> i.name == file.name && i.uri == file.uri)!= index){
                    return false;
                }else{
                    return true;
                }
            })
            //Check for duplicates
            const dupes = uploads.filter((file, index)=>{
                return uploads.findIndex((i)=> i.name == file.name)!= index;
            })
            if(dupes.length !=0) throw new Error("found duplicates : "+ dupes.join("\n"));
            console.warn("Uploads : ", uploads);
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
                        if(body.message){
                            errors.push(body.message)
                        }else{

                        }
                    }
                }catch(e){
                    console.warn(e);
                    errors.push(e.message);
                }
                
                
            }
            if(0 < errors.length){
                console.warn('Errors : ', errors);
                return this.setState({status: "error", statusText: errors.join("\n")});
            }

            this.setState({status: "idle", statusText: "Synchronized!"});
            
        }).catch(e=>{
            console.warn("Caught error : ", e);
            this.setState({status: "error", statusText: "Error : "+e.message});
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