import React from "react";
import {Link} from "@react-navigation/native";
import { useSelector } from "react-redux";
import { getItems } from "@holusion/cache-control";


export default function ObjectLink({to, encoded=true, ...rest}){
  const id = encoded?decodeURIComponent(to): to;
  const targetItem = useSelector((state)=>getItems(state)[id]);
  const category = targetItem.category? targetItem.category : "Undefined";
  return (<Link to={`/${category}?${to}`}
    {...rest}
  />)
}