import React, { useState } from "react";
import {Button, ListItem, Segment, Text, View, Left, Right, Body, Icon, Header} from "native-base";
import { useSelector } from "react-redux";
import { getErrors, getLogs } from "@holusion/cache-control";
import SettingsHeader from "./SettingsHeader";
import { FlatList } from "react-native";
import { theme } from "../../style";


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

  return (<ListItem onPress={onPress} selected={active} style={{flexDirection: "column", alignItems: "flex-start"}}>
      <View style={{display: "flex", flexDirection: "row", alignItems:"stretch", justifyContent:"flex-start"}}>
        <Left style={{flex:0, flexDirection:"row", alignItems:"baseline"}}>
          <Text style={{ fontSize: 12, width:75, color:"#666666FF"}}>{timestamp.toLocaleTimeString()}</Text>
          <Text style={{fontSize: 14, color: color}}>[{name}] </Text>
        </Left>
        <Body style={{flex: 1, alignItems: "flex-start", flexDirection: "row"}}>
          <Text style={{fontSize: 14, lineHeight: 14}} >{message}</Text>
        </Body>
        <Right style={{flex:0}}>
          {context && (<Icon type="Ionicons" name={(active)? "chevron-up-outline": "chevron-down-outline"}/>)}
        </Right>
      </View>
    {active && <View style={{flex:1}}>
      <Text style={{fontSize: 13, paddingLeft: 2, color:"#666666FF", paddingTop: 8, paddingLeft: 8}}>{context}</Text>
    </View>}
    </ListItem>)
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
      <Segment>
        <Button  iconLeft first active={type === "errors"} onPress={()=>setType("errors")}>
          <Icon name="information-circle-outline"/>
          <Text>Erreurs</Text>
        </Button>
        <Button iconRight last active= {type === "messages"} onPress={()=>setType("messages")}>
          <Text>Messages</Text>
          <Icon name="bug-outline"/>
        </Button>
      </Segment>
    </SettingsHeader>
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
