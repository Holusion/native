'use strict';
import React from 'react';
import { connect} from 'react-redux'

import { Container, StyleProvider, Toast, ListItem, Icon, Footer, Button, Content, Text} from 'native-base';
import { StyleSheet, View, TouchableOpacity, FlatList} from 'react-native';

import {setActive} from "../actions";

class ConnectScreen extends React.Component {
    render() {
        const list = this.props.products.map((p)=>{
            return Object.assign({key: p.name}, p);
        });
        let child;
        if(list.length == 0){
            child = (<View style={styles.noProduct}>
                <Text>Aucun produit accessible. Vérifiez la connection réseau</Text>
                <Button primary onPress={()=>this.props.navigation.goBack()} ><Text style={{paddingHorizontal:15}}> Back </Text></Button>
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
                <Button full light onPress={()=> this.props.navigation.navigate("Update")}><Text>Update local files</Text></Button>
            </Footer>)
        }
        return (
            <Container style={{flex: 1}}>
                <Content>
                    <View style={styles.container}>
                        {child}
                    </View> 
                </Content>
                {footer}
                
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
    },
    updater: {
        
    },
    noProduct:{
        paddingTop: 15,
        alignItems: 'center',

    }
});

function mapStateToProps(state){
    const {products, network} = state;
    return {products, isConnected: network.status == "online"};
}
export default connect(mapStateToProps, {setActive})(ConnectScreen);