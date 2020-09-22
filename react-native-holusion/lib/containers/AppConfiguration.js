'use strict';
import React, {useState} from 'react';
import { connect} from 'react-redux'

import { ListItem, Icon, Button, Content, Text, Form, Item, Input, CheckBox, Picker, Body} from 'native-base';

import {setPurge, setSlidesControl, setProjectName} from "../actions";


function AppConfiguration(props){
    const [name, setName] = useState(props.projectName);
    const handleSubmitName = ()=>{
        props.setProjectName(name);
    }

    return (<Content>
        <ListItem  style={{paddingHorizontal:4}}>
            <Body>
                <Text>Purger les produits</Text>
                <Text style={{fontSize:14}} >Retire les vidéos inutilisées du produit cible</Text>
            </Body>
            <CheckBox checked={props.purge} style={{width:30, height:30, paddingTop: 6, paddingLeft: 1}} onPress={()=>props.setPurge(!props.purge)} />
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
        {props.configurableProjectName && <ListItem>
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
        </ListItem>}
    </Content>)
}


const ConnectedAppConfiguration = connect(
    ({conf})=>({
        purge: conf.purge_products,
        slides_control: conf.slides_control,
        configurableProjectName: conf.configurableProjectName,
        projectName: conf.projectName
    }), 
    { setPurge, setSlidesControl, setProjectName }
)(AppConfiguration);

export default ConnectedAppConfiguration;