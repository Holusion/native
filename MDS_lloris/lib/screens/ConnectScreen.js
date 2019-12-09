'use strict';
import React from 'react';
import { connect} from 'react-redux'

import { Container, Form, Label, Content, StyleProvider, Toast, ListItem, Icon, Footer, Button, Text, H1, Input, Item} from 'native-base';
import { StyleSheet, View, TouchableOpacity, FlatList} from 'react-native';

import UserInactivity from 'react-native-user-inactivity';

import {setActive} from "@holusion/react-native-holusion/lib/actions";

class ConnectScreen extends React.Component {
    onCodeChange(value){
        if(value === "052014"){
            this.setState({authorized: true});
        }
    }
    render() {
        if(!this.state.authorized){
            return(<UserInactivity timeForInactivity={40000} onAction={()=>this.props.navigation.navigate("Home")}>
                <Container style={styles.container}>
                    <Form>
                        <Item floatingLabel>
                            <Label>Code</Label>
                            <Input keyboardType="number-pad" style={{color:"white"}} onChangeText={this.onCodeChange.bind(this)}/>
                        </Item>
                    </Form>
                </Container>
            </UserInactivity>)
        }

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
            child = <FlatList data={list} renderItem={({item}) => (<ListItem style={{justifyContent:"center", flex:1}} onPress={this.handlePress.bind(this, item)} selected={(item.active)?true:false}>
                <Text style={{color: "white"}}>{item.name+((this.props.default_target == item.name)?"(default)":"")}</Text>
                <Icon style={{marginLeft:16, color: "white"}} name="ios-arrow-forward"/>
            </ListItem>)} keyExtractor={item=>item.name}/>
        }
        let footer = null;
        if(this.props.isConnected){
            footer = (<Footer>
                <Button full light onPress={()=> this.props.navigation.navigate("Update")}><Text>Mettre à jour les fichiers locaux</Text></Button>
            </Footer>)
        }
        return (
            <Container style={styles.container}>
                <Content>
                    {child}
                </Content>
                {footer}
            </Container>
        )
    }
    handlePress(item){
        this.props.setActive(item);
        this.props.navigation.navigate("Synchronize");
    }
    constructor(props) {
        super(props);
        this.state = {authorized: false};
    }
}

const styles = StyleSheet.create({
    noProduct:{
        paddingTop: 15,
        alignItems: 'center',

    },
    container:{
        backgroundColor: "#000000ff",
        paddingTop: 80
    }
});

function mapStateToProps(state){
    const {products, network, data} = state;
    return {
        products, 
        isConnected: network.status == "online", 
        default_target: data.config.default_target,
    };
}
export default connect(mapStateToProps, {setActive})(ConnectScreen);