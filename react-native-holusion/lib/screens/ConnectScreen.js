'use strict';
import React, {useState} from 'react';
import { connect} from 'react-redux'

import { Container, StyleProvider, Toast, ListItem, Icon, Footer, Button, Content, Text, Form, Item, Input} from 'native-base';
import { StyleSheet, View, TouchableOpacity, FlatList} from 'react-native';

import {setActive, setDefaultTarget} from "../actions";


function AskPass({onSubmit, keyboardType="default"}){
    const [content, setContent] = useState();
    const [error, setError] = useState(false);
    function handleSubmit(e){
        if(onSubmit(content) === false) return setError(true);
    }
    return <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <Form style={{paddingTop:60, minWidth:300}}>
            <Text style={{textAlign: "center", fontSize:15, color:"red"}}>{error != false ? "Mot de passe invalide. Rééssayez.": " "}</Text>
            <Item last error={error} style={{marginBottom:15}}>
                <Input placeholder="Passcode" keyboardType={keyboardType} secureTextEntry={true}  onChangeText={setContent} value={content}/>
            </Item>
            <Button primary onPress={handleSubmit}><Text style={{paddingHorizontal:15}}> Valider</Text></Button>
        </Form>
    </View>
}

class ConnectScreen extends React.Component {
    render() {
        let has_default = this.props.default_target && this.props.products.findIndex((p)=>p.name == this.props.default_target) !== -1; 
        const list = this.props.products.map((p)=>({key: p.name, ...p}));
        if(!has_default && this.props.default_target){
            list.push({name:`Default (offline): ${this.props.default_target}`, active: false, key: this.props.default_target, disabled: true})
        }
        console.warn("Items :; ", list);
        let child;
        if(this.props.passcode && !this.state.authenticated ){
            child =  (<Content>
                <AskPass onSubmit={this.handlePasscode} keyboardType="default"/>
            </Content>)
        }else if(list.length == 0){
            child = (<Content><View style={styles.noProduct}>
                        <Text>Aucun produit accessible. Vérifiez la connection réseau</Text>
                        <Button primary onPress={()=>this.props.navigation.goBack()} ><Text style={{paddingHorizontal:15}}> Back </Text></Button>
                    </View></Content>)
        }else{
            child = (<FlatList style={{paddingTop:60}} data={list} renderItem={({item}) => {
                const isDefault = this.props.default_target == item.name;
                return (<ListItem style={{justifyContent:"space-between", flex: 1, flexDirection:"row"}} disabled={item.disabled} onPress={this.handlePress.bind(this, item)} selected={(item.active)?true:false}>
                {isDefault? (<Text>Default</Text> ): (<Button onPress={()=>this.props.setDefaultTarget(item.name)}><Text>Set Default</Text></Button>)}
                <Text style={{flex:1, textAlign:"center"}}>{item.name}</Text>
                <Icon style={{marginLeft:16}} name="ios-arrow-forward"/>
            </ListItem>)
            }} keyExtractor={item=>item.name}/>)
        }
        return (<Container style={{flex: 1}}>
                {child}
        </Container>)

    }
    handlePasscode = (code)=>{
        if(code !== this.props.passcode) return false;
        this.setState({authenticated: true});
    }

    handlePress(item){
        this.props.setActive(item);
        this.props.navigation.navigate("Synchronize");
    }

    constructor(props) {
        super(props);
        this.state = {authenticated: false};
    }
}

const styles = StyleSheet.create({
    noProduct:{
        paddingTop: 60,
        alignItems: 'center',

    }
});

function mapStateToProps(state){
    const {products, network, data} = state;
    return {
        default_target: data.default_target,
        products,
        isConnected: network.status == "online", 
        passcode: data.config.passcode
    };
}
export default connect(mapStateToProps, {setActive, setDefaultTarget})(ConnectScreen);