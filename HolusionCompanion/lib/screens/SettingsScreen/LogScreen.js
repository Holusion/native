import React, { useState } from "react";
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from "react-redux";
import { getErrors, getLogs } from "@holusion/cache-control";
import SettingsHeader from "./SettingsHeader";
import { FlatList, StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { theme } from "../../components/style";


export function Log({severity, name, message, context, timestamp, active, onPress}){
  let color = "yellow";
  switch(severity){
    case "error":
      color = theme.colors.error;
      break;
    case "warn":
      color = theme.colors.warning;
      break;
    case "info":
      color = theme.colors.info;
      break;
  }

  return (<TouchableOpacity onPress={onPress} selected={active} style={{flexDirection: "column", alignItems: "flex-start", padding:10}}>
      <View style={{display: "flex", flexDirection: "row", alignItems:"stretch", justifyContent:"flex-start"}}>
        <View style={{flex:0, flexDirection:"row", alignItems:"baseline"}}>
          <Text style={{ fontSize: 12, width:75, color:"#666666FF"}}>{timestamp.toLocaleTimeString()}</Text>
          <Text style={{fontSize: 14, color: color}}>[{name}] </Text>
        </View>
        <View style={{flex: 1, alignItems: "flex-start", flexDirection: "row"}}>
          <Text style={{fontSize: 14, lineHeight: 14}} >{message}</Text>
        </View>
        <View style={{flex:0}}>
          {context && (<Icon type="Ionicons" name={(active)? "chevron-up-outline": "chevron-down-outline"}/>)}
        </View>
      </View>
    {active && <View style={{flex:1}}>
      <Text style={{fontSize: 13, paddingLeft: 2, color:"#666666FF", paddingTop: 8, paddingLeft: 8}}>{context}</Text>
    </View>}
    </TouchableOpacity>)
}

export default function LogScreen({navigation}){
  const [activeIndex, setActiveIndex] = useState(-1);
  const [type, setType] = useState("errors");
  const errors = useSelector(getErrors);
  const logs = useSelector(getLogs);
  let data = [...(type=== "errors"? errors:logs)];
  data.reverse();
  return <View style={{backgroundColor:"white", minHeight: "100%"}}>
    <SettingsHeader back>

    </SettingsHeader>
      <View style={style.nav}>
        <TouchableOpacity style={[style.btn, type === "errors" && style.active]} active={type === "errors"} onPress={()=>setType("errors")}>
          <Text style={[{fontWeight:"bold"},type === "errors" && {color: theme.colors.info}]}>Erreurs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[style.btn, type === "messages" && style.active]} onPress={()=>setType("messages")}>
          <Text style={[{fontWeight:"bold"},type === "messages" && {color: theme.colors.info}]}>Messages</Text>
        </TouchableOpacity>
      </View>    
    <FlatList
      ListEmptyComponent={<Text>{type == "errors"? "Aucune erreur" : "Aucun message"}</Text>}
      data={data}
      keyExtractor={({id})=>(`${id}`)}
      renderItem={({item, index})=>(<Log {...item} 
        active={activeIndex=== index} 
        onPress={()=>setActiveIndex(activeIndex=== index? -1: index)}
      />)}
    />
  </View>
}

const style = StyleSheet.create(
  {
    nav:{
      display: "flex",
      flexDirection: "row",
      paddingBottom: 10
    },
    btn:{
      paddingVertical: 10,
      alignItems: "center",
      flex: 1,
    },
    active:{
      borderBottomWidth: 1.5,
      borderBottomColor: theme.colors.info,
      color: theme.colors.info,
    }
  }
)
