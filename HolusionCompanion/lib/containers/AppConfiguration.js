'use strict';
import React, {useState} from 'react';
import { connect} from 'react-redux'
import { Text, View } from "react-native";

import {setPurge, setSlidesControl, setProjectName, setPlayControl, setPasscode, setWatch} from "@holusion/cache-control";
import { BgIcon } from '../components';
import { TextInput } from 'react-native-gesture-handler';
import CheckBox from '@react-native-community/checkbox';

function AppConfiguration(props){
    const [watch, setWatch] = useState(props.watch);
    const [name, setName] = useState(props.projectName);
    const [passcode, setPasscode] = useState(props.passcode);

    return (<React.Fragment>

        <View style={props.style.listView}>
          <View>
            <BgIcon name="film-outline"/>
          </View>
          <View style={{flex:1, paddingLeft:10}}>
              <Text>Application cible</Text>
              <Text style={{fontSize:14}} >sur content.holusion.com</Text>
          </View>
          <View style={{flex:1, paddingLeft:10}}>
            <TextInput style={{padding:5, borderBottomWidth:1}} placeholder="application" editable={props.configurableProjectName} blurOnSubmit returnKeyType="next" autoCapitalize="none" autoCompleteType="off" autoCorrect={false} onChangeText={(v)=>setName(v)} onSubmitEditing={()=>props.setProjectName(name)} value={name}/>
          </View>
        </View>
        <View style={props.style.listView}>
          <View>
            <BgIcon name="key-outline"/>
          </View>
          <View style={{flex:1, paddingLeft:10}}>
              <Text>Passcode</Text>
              <Text style={{fontSize:14}} >Code pin d'accès à cet écran</Text>
          </View>
          <View style={{flex:1, paddingLeft:10}}>
            <TextInput style={{padding:5, borderBottomWidth:1}} placeholder="aucun" keyboardType="numeric" blurOnSubmit returnKeyType="next" autoCapitalize="none" autoCompleteType="off" secureTextEntry={true} autoCorrect={false} onChangeText={(v)=>setPasscode(v)} onSubmitEditing={()=>props.setPasscode(passcode)} value={passcode}/>
          </View>
        </View>
        <View style={props.style.listView}>
          <View>
            <BgIcon name="globe-outline"/>
          </View>
          <View style={{flex:1, paddingLeft:10}}>
            <Text>Mise à jour auto</Text>
            <Text style={{fontSize:14}} >{props.watch?"en permanence": "au démarrage"}</Text>
          </View>
          <View>
            <CheckBox lineWidth={1} animationDuration={0} value={watch} onValueChange={()=>{setWatch(!watch);props.setWatch(!watch)}}/>
          </View>
        </View>
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