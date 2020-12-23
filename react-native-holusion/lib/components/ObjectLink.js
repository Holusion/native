import React, { useEffect } from "react";
import {Link, useNavigation, StackActions} from "@react-navigation/native";
import { useSelector } from "react-redux";
import { getItems } from "@holusion/cache-control";



export function parseItem({id, category="Undefined"}){
  return {category, params:{id}};
}

export function useParsedLink({to, encoded=true}){
  const id = encoded?decodeURIComponent(to): to;
  const targetItem = useSelector((state)=>getItems(state)[id]);
  return parseItem(targetItem);
}

export default function ObjectLink({to:name, encoded=true, ...rest}){
  const {category, params} = useParsedLink({to: name, encoded});
  return (<Link action={StackActions.navigate(category, params)} {...rest} />);
}

export function Redirect({to, encoded=true, action="replace"}){
  const navigation = useNavigation();
  const {category, params} = useParsedLink({to, encoded});
  useEffect(()=>{
    navigation[action]("Object", {screen: category, params});
  }, [navigation, action, category, params]);
  return null;
}