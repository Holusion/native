import React, { useEffect } from "react";
import {Link, useNavigation, StackActions} from "@react-navigation/native";
import { useSelector } from "react-redux";
import { getItems } from "@holusion/cache-control";



export function parseItem({id, category="Undefined"}){
  return {screen: category, params:{id}};
}

export function useParsedLink({to, encoded=true}){
  const id = encoded?decodeURIComponent(to): to;
  const targetItem = useSelector((state)=>getItems(state)[id]);
  if(!targetItem){
    switch(id){
      case "Settings":
      case "Contact":
      case "Home":
        return {screen: id, params: {}};
      default:
        return {screen: "404", params:{id}}
    }
  }
  return parseItem(targetItem);
}

export default function ObjectLink({to:name, encoded=true, ...rest}){
  const {screen, params} = useParsedLink({to: name, encoded});
  return (<Link action={StackActions.navigate(screen, params)} {...rest} />);
}

export function Redirect({to, encoded=true, action="replace"}){
  const navigation = useNavigation();
  const {screen, params} = useParsedLink({to, encoded});
  useEffect(()=>{
    navigation[action]("Object", {screen, params});
  }, [navigation, action, screen, params]);
  return null;
}