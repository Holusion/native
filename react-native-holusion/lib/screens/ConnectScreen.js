'use strict';
import React, {useState} from 'react';
import { connect} from 'react-redux'

import { Container, StyleProvider, Toast, ListItem, Icon, Footer, Button, Content, Text, Title, Form, Item, Input, CheckBox, Picker, Body} from 'native-base';
import { StyleSheet, View, TouchableOpacity, FlatList} from 'react-native';

import {setActive, setDefaultTarget, setPurge, setSlidesControl} from "../actions";


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

        if(this.props.passcode && !this.state.authenticated ){
            return (<Container>
                <AskPass onSubmit={this.handlePasscode} keyboardType="default" />
            </Container>)
        }


        let configuration = (<Content>
            <ListItem onPress={()=>this.props.setPurge(!this.props.purge)} style={{paddingHorizontal:4}}>
                <Body>
                    <Text>Purger les produits</Text>
                    <Text style={{fontSize:14}} >Retire les vidéos inutilisées du produit cible</Text>
                </Body>
                <CheckBox checked={this.props.purge} />
            </ListItem>
            <ListItem style={{paddingHorizontal:4, flexDirection:"row"}} >
                <Body style={{flex:1}}>
                    <Text>Changement de page</Text>
                    <Text style={{fontSize:14}} >Passer directement d'un objet à l'autre</Text>
                </Body>
                <Picker note mode="dropdown" selectedValue={this.props.slides_control} onValueChange={(value)=>this.props.setSlidesControl(value)} >
                    <Picker.Item label="Swipe et boutons" value="default"/>
                    <Picker.Item label="Boutons" value="buttons"/>
                    <Picker.Item label="Swipe" value="swipe"/>
                </Picker>
            </ListItem>
        </Content>)
        let child;
        if(list.length == 0){
            child = (<View style={styles.noProduct}>
                    <Text>Aucun produit accessible. Vérifiez la connection réseau</Text>
                    <Button primary onPress={()=>this.props.navigation.goBack()} ><Text style={{paddingHorizontal:15}}> Back </Text></Button>
                </View>)
        }else{
            child = (<FlatList style={{}} data={list} renderItem={({item}) => {
                    const isDefault = this.props.default_target == item.name;
                    return (<ListItem style={{justifyContent:"space-between", flex: 1, flexDirection:"row"}} disabled={item.disabled} onPress={this.handlePress.bind(this, item)} selected={(item.active)?true:false}>
                        <Button light={!isDefault} primary={isDefault} style={{width:160}} onPress={isDefault? null: ()=>this.props.setDefaultTarget(item.name)}>
                            <Text>{isDefault?"Par Défaut": "Utiliser"}</Text>
                        </Button>
                        <Text style={{flex:1, textAlign:"center"}}>{item.name}</Text>
                        <Icon style={{marginLeft:16}} name="ios-sync"/>
                    </ListItem>)
                }}  keyExtractor={item=>item.name}/>)
        }
        return (<Container style={{flex: 1, flexDirection:"row"}}>
            <View style={{flex:1}}>
                <Title primary style={styles.title}>Produits : </Title>
                {child}
            </View>
            <View style={{flex:1}}>
                <Title primary style={styles.title}>Configuration : </Title>
                {configuration}
            </View>
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
    title: {
        marginTop: 15,
        paddingBottom: 15,
    },
    noProduct: {
        alignItems: 'center',

    }
});

function mapStateToProps(state){
    const {products, network, data} = state;
    return {
        default_target: data.default_target,
        purge: data.purge_products,
        slides_control: data.slides_control,
        products,
        isConnected: network.status == "online", 
        passcode: data.config.passcode
    };
}
export default connect(mapStateToProps, {setActive, setDefaultTarget, setPurge, setSlidesControl})(ConnectScreen);