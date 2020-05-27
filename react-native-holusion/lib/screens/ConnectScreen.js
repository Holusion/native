'use strict';
import React, {useState} from 'react';
import { connect} from 'react-redux'

import { Container, StyleProvider, Toast, ListItem, Icon, Footer, Button, Content, Text, Title, Form, Item, Input, CheckBox, Picker, Body} from 'native-base';
import { StyleSheet, View, TouchableOpacity, FlatList, Keyboard} from 'react-native';

import {setActive, setDefaultTarget, setPurge, setSlidesControl, setProjectName} from "../actions";
import { ScrollView } from 'react-native-gesture-handler';


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

function Configuration(props){
    const [name, setName] = useState(props.projectName);
    const handleSubmitName = ()=>{
        props.setProjectName(name);
        Keyboard.dismiss();
    }

    return (<Content>
        <ListItem onPress={()=>props.setPurge(!props.purge)} style={{paddingHorizontal:4}}>
            <Body>
                <Text>Purger les produits</Text>
                <Text style={{fontSize:14}} >Retire les vidéos inutilisées du produit cible</Text>
            </Body>
            <CheckBox checked={props.purge} />
        </ListItem>
        <ListItem style={{paddingHorizontal:4, flexDirection:"row"}} >
            <Body style={{flex:1}}>
                <Text>Changement de page</Text>
                <Text style={{fontSize:14}} >Passer directement d'un objet à l'autre</Text>
            </Body>
            <Picker note mode="dropdown" selectedValue={props.slides_control} onValueChange={(value)=>props.setSlidesControl(value)} >
                <Picker.Item label="Swipe et boutons" value="default"/>
                <Picker.Item label="Boutons" value="buttons"/>
                <Picker.Item label="Swipe" value="swipe"/>
            </Picker>
        </ListItem>
        <ListItem>
            <Body style={{flex:1}}>
                <Text>Application cible</Text>
                <Text style={{fontSize:14}} >Autorisation requise sur content.holusion.com</Text>
            </Body>
            <Form style={{ flex: 1, flexDirection:"row"}}>
                <Item last style={{flex:1}} >
                    <Input placeholder="application" editable={props.configurableProjectName} autoCapitalize="none" autoCompleteType="off" autoCorrect={false} onChangeText={setName} value={name}/>
                </Item>
                <Button bordered info style={{minWidth:50}} disabled={name === props.projectName} onPress={handleSubmitName}><Icon large primary type="Ionicons" name="ios-send" /></Button>
            </Form>
        </ListItem>
    </Content>)
}


const ConnectedConfiguration = connect(
    ({conf})=>({
        purge: conf.purge_products,
        slides_control: conf.slides_control,
        configurableProjectName: conf.configurableProjectName,
        projectName: conf.projectName
    }), 
    { setPurge, setSlidesControl, setProjectName }
)(Configuration);

function LifeState(props){
    let list = Object.keys(props.taskList).sort().map((taskId)=>{
        let t = props.taskList[taskId];
        let color;
        switch(t.status){
            case "success":
                color="green";
                break;
            case "disconnected":
                color="orange";
                break;
            case "error":
                color="red";
                break;
            case "pending":
                color= "orange";
                break;
            default:
                color="blue";
                break;
        }
        return (<ListItem key={taskId} style={{justifyContent:"space-between", flex: 1, flexDirection:"row"}}>
            <Text >{t.title || taskId} : </Text>
            <Text style={{color, fontSize: 14}} >{t.message || t.status}</Text>
        </ListItem>)
    })
    return (<View>{list}</View>)
}
const ConnectedLifeState = connect(
    ({tasks})=>({
        taskList: tasks.list,
    }), 
    {}
)(LifeState);

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


        let child;
        if(list.length == 0){
            child = (<View style={styles.noProduct}>
                    <Text>Aucun produit accessible. Vérifiez la connection réseau</Text>
                    <Button primary onPress={()=>this.props.navigation.goBack()} ><Text style={{paddingHorizontal:15}}> Back </Text></Button>
                </View>)
        }else{
            child = (<FlatList data={list} renderItem={({item}) => {
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
                <ScrollView>
                    <Title primary style={styles.title}>Produits : </Title>
                    {child}
                    <Title primary style={styles.title}>Etat : </Title>
                    <ConnectedLifeState/>
                </ScrollView>
            </View>
            <View style={{flex:1}}>
                <Title primary style={styles.title}>Configuration : </Title>
                <ConnectedConfiguration/>
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
    const {products, conf, data} = state;
    return {
        default_target: conf.default_target,
        products,
        passcode: data.config.passcode,
        configurableProjectName: conf.configurableProjectName,
    };
}
export default connect(mapStateToProps, {setActive, setDefaultTarget})(ConnectScreen);