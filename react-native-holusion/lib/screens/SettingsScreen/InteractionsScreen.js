import React from "react";
import { Body, CheckBox, Container, Content, Icon, Left, List, ListItem, Right, Separator, Text } from "native-base";
import {BgIcon} from "../../components";
import { useDispatch, useSelector } from "react-redux";
import { setSlidesControl, setPlayControl, getConf } from "@holusion/cache-control";
import SettingsHeader from "./SettingsHeader";

export function Pick({label, help, active, onPress}){
  let iconColor;
  if(active){
    iconColor = "primary";
  }else{
    iconColor = "muted";
  }

  return ( <ListItem onPress={onPress}>
    <Left>
      <Text style={{color: BgIcon.colors[active?"default": "muted"], fontSize: 17 }}>{label}</Text>
    </Left>
    <Body>
      <Text style={{color: BgIcon.colors[active?"default": "muted"], fontSize: 14 }}>{help}</Text>
      </Body>
    <Right><CheckBox style={{paddingLeft: 0}} checked={active}/></Right>
  </ListItem>)
}

export function SettingPicker({items, value, onChange, title}){
  return <React.Fragment>
    <Separator>
      <Text>{title}</Text>
    </Separator>
    {items.map((item)=>(<Pick key={item.value} active={item.value ===value} label={item.label} help={item.help} onPress={()=>onChange(item.value)}/>))}
  </React.Fragment>
}

/*
      <Body style={{flex:1}}>
          <Text>Play/Pause</Text>
          <Text style={{fontSize:14}} >Commande du lecteur vidéo</Text>
      </Body>
      <Picker mode="dropdown" selectedValue={props.play_control} onValueChange={(value)=>props.setPlayControl(value)} >
          <Picker.Item label="Aucun" value="none"/>
          <Picker.Item label="Bouton" value="button"/>
          <Picker.Item label="Rotation" value="rotate"/>
      </Picker>
*/

export default function InteractionsScreen(){
  const dispatch = useDispatch();
  const {slides_control, play_control} = useSelector(getConf);
  return (<Container>
    <SettingsHeader back>Interactions</SettingsHeader>
    <Content settings>
      <List>
        <SettingPicker title="Changement de page"
          subtitle="Comment passer directement d'un objet à l'autre"
          onChange={(v)=> dispatch(setSlidesControl(v))}
          value={slides_control}
          items={[
            {label: "Swipe et boutons", help:"Activer tout", value:"default"},
            {label: "Boutons", help:"Flèches directionelles", value: "buttons"},
            {label: "Swipe", help: `Changer d'objet avec un "swipe"`, value: "swipe"},
            {label: "Aucun", help:"aucune navigation d'objet à objet", value: "none"},
          ]}
        />
        <SettingPicker title="Commande du lecteur vidéo"
          onChange={(v)=>dispatch(setPlayControl(v))}
          value={play_control}
          items={[
            {label: "Aucun", help: "Aucun contrôle de la lecture vidéo", value: "none"},
            {label: "Bouton", help: "Bouton pause", value: "button"},
            {label: "Rotation", help: "Rotation temps réel (pour les produits supportés)", value: "rotate"}
          ]}
          />
      </List>
    </Content>
  </Container>)
}