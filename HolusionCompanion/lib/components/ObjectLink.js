import React, { useEffect } from "react";
import {Link, useNavigation, CommonActions} from "@react-navigation/native";
import { useSelector } from "react-redux";
import { getItems } from "@holusion/cache-control";


/**
 * 
 * @param {object} param0 
 * @param {string} param0.id the page ID
 * @param {string} [param0.category] the page's category
 * @returns {{screen:string, params:{id:string}}}
 */
export function parseItem({id, category}){
  return {screen: (category? category : id), params:{id}};
}
/**
 * 
 * @param {object} param0 
 * @param {string} param0.to link string
 * @param {boolean} param0.encoded whether or not the string has been urlencoded
 * @see parseItem
 * @returns {ReturnType<parseItem>}
 */
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
  return (<Link to={screen} action={CommonActions.navigate(screen, params)} {...rest} />);
}

export function Redirect({to, encoded=true, action="replace"}){
  const navigation = useNavigation();
  const {screen, params} = useParsedLink({to, encoded});
  useEffect(()=>{
    navigation[action]("Object", {screen, params});
  }, [navigation, action, screen, params]);
  return null;
}