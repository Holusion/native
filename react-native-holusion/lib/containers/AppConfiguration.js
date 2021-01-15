'use strict';
import React, {useState} from 'react';
import { connect} from 'react-redux'
import {Keyboard} from "react-native";

import { ListItem, Icon, Button, Content, Text, Form, Item, Input, CheckBox, Picker, Body, Left, Right, Switch} from 'native-base';

import {setPurge, setSlidesControl, setProjectName, setPlayControl, setPasscode, setWatch} from "@holusion/cache-control";
import { BgIcon } from '../components';

function AppConfiguration(props){
    const [watch, setWatch] = useState(props.watch);
    const [name, setName] = useState(props.projectName);
    const [passcode, setPasscode] = useState(props.passcode);

    console.log("watch : ", props.watch)
    return (<React.Fragment>

        <ListItem icon>
          <Left>
            <BgIcon name="film-outline"/>
          </Left>
          <Body style={{flex:1}}>
              <Text>Application cible</Text>
              <Text style={{fontSize:14}} >sur content.holusion.com</Text>
          </Body>
          <Right style={{flex:1}}>
            <Form style={{ flex: 1, flexDirection:"row"}}>
                <Item style={{flex:1}} >
                    <Input style={{height:40}} bordered rounded placeholder="application" editable={props.configurableProjectName} blurOnSubmit returnKeyType="next" autoCapitalize="none" autoCompleteType="off" autoCorrect={false} onChangeText={(v)=>setName(v)} onSubmitEditing={()=>props.setProjectName(name)} value={name}/>
                </Item>
            </Form>
          </Right>
        </ListItem>
        <ListItem icon>
          <Left>
            <BgIcon name="key-outline"/>
          </Left>
          <Body style={{flex:1}}>
              <Text>Passcode</Text>
              <Text style={{fontSize:14}} >Code pin d'accès à cet écran</Text>
          </Body>
          <Right style={{flex:1}}>
          <Form style={{ flex: 1, flexDirection:"row"}}>
              <Item style={{flex:1}} >
                  <Input style={{height:40}} placeholder="aucun" keyboardType="numeric" blurOnSubmit returnKeyType="next" autoCapitalize="none" autoCompleteType="off" secureTextEntry={true} autoCorrect={false} onChangeText={(v)=>setPasscode(v)} onSubmitEditing={()=>props.setPasscode(passcode)} value={passcode}/>
              </Item>
          </Form>

          </Right>
        </ListItem>
        <ListItem icon >
          <Left>
            <BgIcon name="globe-outline"/>
          </Left>
          <Body style={{flex:1}}>
            <Text>Mise à jour auto</Text>
            <Text style={{fontSize:14}} >{props.watch?"en permanence": "au démarrage"}</Text>
          </Body>
          <Right>
            <Switch value={watch} onValueChange={()=>{setWatch(!watch);props.setWatch(!watch)}}/>
          </Right>
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
        watch: conf.watch,
    }), 
    { setPurge, setSlidesControl, setPlayControl, setProjectName, setPasscode, setWatch }
)(AppConfiguration);

export default ConnectedAppConfiguration;