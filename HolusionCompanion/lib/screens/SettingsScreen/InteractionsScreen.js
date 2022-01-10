import React from "react";
import { BgIcon } from "../../components";
import { useDispatch, useSelector } from "react-redux";
import { setSlidesControl, setPlayControl, getConf } from "@holusion/cache-control";
import SettingsHeader from "./SettingsHeader";
import { ScrollView, StyleSheet, View, Text, TouchableHighlight, TouchableOpacity } from "react-native";
import CheckBox from '@react-native-community/checkbox';
import { theme } from "../../components/style";

export function Pick({label, help, active, onPress}){

  return ( <TouchableOpacity style={style.listView} onPress={onPress}>
    <View style={{flex:1}}>
      <Text style={{color: BgIcon.color[active?"info": "muted"]}}>{label}</Text>
    </View>
    <View style={{flex:1}}>
      <Text style={{color: BgIcon.color[active?"info": "muted"], fontSize: 14 }}>{help}</Text>
    </View>
    <CheckBox lineWidth={1} animationDuration={0} value={active}/>
  </TouchableOpacity>)
}

export function SettingPicker({items, value, onChange, title}){
  return <React.Fragment>
    <View style={style.listHeader}>
      <Text style={style.listTitle}>{title}</Text>
    </View>
    {items.map((item)=>(<Pick key={item.value} active={item.value ===value} label={item.label} help={item.help} onPress={()=>onChange(item.value)}/>))}
  </React.Fragment>
}

export default function InteractionsScreen(){
  const dispatch = useDispatch();
  const {slides_control, play_control} = useSelector(getConf);
  return (<ScrollView>
    <SettingsHeader back>Interactions</SettingsHeader>
      <View>
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
      </View>
  </ScrollView>)
}

const style = StyleSheet.create({
  listView: {
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  listHeader:{
    padding: 10,
    borderColor: theme.color.light,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    backgroundColor: theme.color.light
  },
  listTitle:{
    fontWeight: "bold",
  },  
})
