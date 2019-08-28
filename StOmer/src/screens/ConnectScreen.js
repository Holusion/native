'use strict';
import React from 'react';
import { connect} from 'react-redux'

import { Container, StyleProvider, Toast, ListItem, Icon, Footer} from 'native-base';
import { StyleSheet, View, TouchableOpacity, Text, FlatList} from 'react-native';

import {setActive} from "../actions";

class ConnectScreen extends React.Component {
    render() {
        const list = this.props.products.map((p)=>{
            return Object.assign({key: p.name}, p);
        });
        let child;
        if(list.length == 0){
            child = (<View style={{paddingTop:15}}>
                <Text>Aucun produit accessible. Vérifiez la connection réseau</Text>
                <Button onPress={()=>this.props.navigation.back()}>Back</Button>
                </View>
            )
        }else{
            child = <FlatList data={list} renderItem={({item}) => (<ListItem onPress={this.handlePress.bind(this, item)} selected={(item.active)?true:false}>
                <Text>{item.name}</Text>
                <Icon style={{marginLeft:16}} name="ios-arrow-forward"/>
            </ListItem>)} keyExtractor={item=>item.name}/>
        }
        let footer = null;
        if(this.props.isConnected){
            footer = (<Footer>
                Connected
            </Footer>)
        }
        return (
            <Container style={{flex: 1}}>
                <View style={styles.container}>
                    {child}
                </View> 
                <Footer>
                </Footer>
            </Container>
        )
    }
    handlePress(item){
        this.props.setActive(item);
        this.props.navigation.goBack();
    }
    constructor(props) {
        super(props);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex', 
        flexDirection: "column", 
        alignItems: 'center',
        paddingTop: 15
    },
    updater: {
        
    }
});

function mapStateToProps(state){
    const {products, network} = state;
    return {products, isConnected: network.status == "online"};
}
export default connect(mapStateToProps, {setActive})(ConnectScreen);