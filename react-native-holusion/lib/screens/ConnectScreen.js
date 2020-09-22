'use strict';
import React, {useState} from 'react';
import { connect} from 'react-redux'

import { Container, ListItem, Icon, Button, Text, Title, Form, Item, Input } from 'native-base';
import { StyleSheet, View, FlatList } from 'react-native';

import {setActive, setDefaultTarget } from "../actions";

import AppState from "../containers/AppState";
import AppConfiguration from "../containers/AppConfiguration";


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
                <Input placeholder="Passcode" keyboardType={keyboardType} secureTextEntry={true} onChangeText={setContent} value={content}/>
            </Item>
            <Button primary onPress={handleSubmit}><Text style={{paddingHorizontal:15}}> Valider</Text></Button>
        </Form>
    </View>
}




// Configure application
//FIXME : Will be password-protected only if configurableProjectName is false as a temporary workaround
class ConnectScreen extends React.Component {
    render() {
        let has_default = this.props.default_target && this.props.products.findIndex((p)=>p.name == this.props.default_target) !== -1; 
        const list = this.props.products.map((p)=>({key: p.name, ...p}));
        if(!has_default && this.props.default_target){
            list.push({name:`Default (offline): ${this.props.default_target}`, active: false, key: this.props.default_target, disabled: true})
        }

        if(this.props.passcode && !this.props.configurableProjectName && !this.state.authenticated ){
            return (<Container>
                <AskPass onSubmit={this.handlePasscode} keyboardType="default" />
            </Container>)
        }
        const renderItem = ({item})=>{
            const isDefault = this.props.default_target == item.name;
            return (<ListItem style={{justifyContent:"space-between", flex: 1, flexDirection:"row"}} disabled={item.disabled} onPress={this.handlePress.bind(this, item)} selected={(item.active)?true:false}>
                <Button light={!isDefault} primary={isDefault} style={{width:160}} onPress={isDefault? null: ()=>this.props.setDefaultTarget(item.name)}>
                    <Text>{isDefault?"Par Défaut": "Utiliser"}</Text>
                </Button>
                <Text style={{flex:1, textAlign:"center"}}>{item.name}</Text>
                <Icon style={{marginLeft:16}} name="ios-sync"/>
            </ListItem>)
        }
        return (<Container style={{flex: 1, flexDirection:"row"}}>
            <View style={{flex:1}}>
                    <FlatList
                    ListHeaderComponent={<Title primary style={styles.title}>Produits : </Title>}
                    ListEmptyComponent={<ListItem>
                        <Text>Aucun produit accessible. Vérifiez la connection réseau</Text>
                    </ListItem>}

                    data={list} 
                    renderItem={renderItem} 
                    keyExtractor={item=>item.name}

                    ListFooterComponent={<View>
                        <Title primary style={styles.title}>Etat : </Title>
                        <AppState/>
                    </View>}
                />
            </View>
            <View style={{flex:1}}>
                <Title primary style={styles.title}>Configuration : </Title>
                <AppConfiguration/>
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
        textAlign: "left",
        marginTop: 15,
        paddingBottom: 15,
    },
    noProduct: {
        alignItems: 'center',

    }
});

function mapStateToProps(state){
    const {products, conf, data} = state;
    return {
        default_target: conf.default_target,
        products,
        passcode: data.config.passcode,
        configurableProjectName: conf.configurableProjectName,
    };
}
export default connect(mapStateToProps, {setActive, setDefaultTarget})(ConnectScreen);