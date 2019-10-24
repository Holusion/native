'use strict';
import React from 'react';
import { connect} from 'react-redux'

import RNFS from 'react-native-fs';

import { Container, StyleProvider, Toast, ListItem, Icon, Footer, Button, Content, Text} from 'native-base';
import { StyleSheet, TouchableOpacity, FlatList} from 'react-native';

import StatusIcon from "../components/StatusIcon";

import {filename, dedupeList, uploadFile} from "../files";

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
    send(){
        if(this.state.status =="loading") return;
        if(!this.props.target){
            return this.setState({status: "error", statusText: "no target product selected"})
        }
        this.setState({status: "loading", statusText: "fetching playlist"});
        const url = `http://${this.props.target.url}`;
        fetch(`${url}/playlist`, {method:"GET"})
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

            this.setState({statusText: "Getting modification time"});
            //Can throw an error but we don't want to catch it here
            const uploads_with_mtime = [];
            //Don't parallelize : it cause iOS to crash the app
            for (let upload of uploads){
                const stat = await RNFS.stat(upload.uri);

                uploads_with_mtime.push(Object.assign({mtime:stat.mtime}, upload))
            }

            const unique_uploads = dedupeList(uploads_with_mtime, list);
            this.setState({statusText: "Uploading files"});
            for (const file of unique_uploads){
                try{
                    if(list.find(i=>i.name == file.name)){
                        this.setState({statusText: "Deleting old "+ file.name});
                        await fetch(`${url}/medias/${file.name}`, {method: "DELETE"});
                    }
                    this.setState({statusText: "Uploading "+ file.name});
                    await uploadFile(url, file);
                } catch(e){
                    console.warn(e);
                    errors.push(e);
                }
            }
            if(0 < errors.length){
                console.warn('Errors : ', errors);
                return this.setState({status: "error", statusText: errors.map(e=>`${e.sourceFile} : ${e.message}`).join("\n")});
            }

            this.setState({status: "idle", statusText: "Synchronized!"});
            
        }).catch(e=>{
            console.warn("Caught error : ", e);
            this.setState({status: "error", statusText: "Error : "+e.message});
        }).then(()=>this.setState({status:"idle"}));
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