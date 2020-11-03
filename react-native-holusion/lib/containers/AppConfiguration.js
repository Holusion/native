'use strict';
import React, {useState} from 'react';
import { connect} from 'react-redux'
import {Keyboard} from "react-native";

import { ListItem, Icon, Button, Content, Text, Form, Item, Input, CheckBox, Picker, Body} from 'native-base';

import {setPurge, setSlidesControl, setProjectName, setPlayControl, setPasscode} from "@holusion/cache-control";

function AppConfiguration(props){
    const [name, setName] = useState(props.projectName);
    const [passcode, setPasscode] = useState(props.passcode);
    const handleSubmitName = ()=>{
      Keyboard.dismiss();
      props.setProjectName(name);
    }
    const handleSubmitPasscode = ()=>{
      Keyboard.dismiss();
      props.setPasscode(passcode);
    }

    return (<React.Fragment>
        <ListItem  style={{paddingHorizontal:4}}>
            <Body>
                <Text>Purger les produits</Text>
                <Text style={{fontSize:14}} >Retire les vidéos inutilisées du produit cible</Text>
            </Body>
            <CheckBox checked={props.purge} style={{paddingLeft: 0}} onPress={()=>props.setPurge(!props.purge)} />
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
                {props.configurableProjectName &&<Button bordered info style={{minWidth:50}} disabled={name === props.projectName} onPress={handleSubmitName}>
                    <Icon large primary type="Ionicons" name="ios-send" />
                </Button>}
            </Form>
        </ListItem>
        <ListItem>
            <Body style={{flex:1}}>
                <Text>Passcode</Text>
                <Text style={{fontSize:14}} >Code pin d'accès à cet écran</Text>
            </Body>
            <Form style={{ flex: 1, flexDirection:"row"}}>
                <Item last style={{flex:1}} >
                    <Input placeholder="aucun" keyboardType="numeric" autoCapitalize="none" autoCompleteType="off" secureTextEntry={true} autoCorrect={false} onChangeText={setPasscode} value={passcode}/>
                </Item>
                <Button bordered info style={{minWidth:50}}  onPress={handleSubmitPasscode} disabled={passcode === props.passcode}>
                    <Icon large primary type="Ionicons" name="ios-send" />
                </Button>
            </Form>
        </ListItem>
    </React.Fragment>)
}


const ConnectedAppConfiguration = connect(
    ({conf})=>({
        purge: conf.purge_products,
        slides_control: conf.slides_control,
        play_control: conf.play_control,
        configurableProjectName: conf.configurableProjectName,
        projectName: conf.projectName,
        passcode: conf.passcode,
    }), 
    { setPurge, setSlidesControl, setPlayControl, setProjectName, setPasscode }
)(AppConfiguration);

export default ConnectedAppConfiguration;