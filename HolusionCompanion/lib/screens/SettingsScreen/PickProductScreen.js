import React from "react"
import { getActiveProduct, setActive, setDefaultTarget, warn } from "@holusion/cache-control";
import { ScrollView, Text, View, TouchableOpacity } from "react-native"
import { useDispatch, useSelector } from "react-redux";
import { BgIcon } from "../../components";
import SettingsHeader from "./SettingsHeader";
import Icon from 'react-native-vector-icons/Ionicons';



export function ProductPick({name, address, active, online, onPress}){
  let iconColor;
  if(!online){
    iconColor = "warning"
  }else if(active){
    iconColor = "info";
  }else{
    iconColor = "muted";
  }
  return ( <TouchableOpacity onPress={onPress} style={{display:"flex", flexDirection: "row", padding:10}}>
    <View>
      <BgIcon status={iconColor} name="link"/>
    </View>
    <View style={{flex:1, paddingHorizontal:10}}><Text style={{color: BgIcon.color[active?"default": "muted"] }}>{name}{address && ` (${address})`}</Text></View>
    <View><Icon style={{color: BgIcon.color[active?"default": "muted"], fontSize:18}} name="checkmark"/></View>
  </TouchableOpacity>)
}

export function ProductPicker({currentName, products, title="Choix de la cible", onChange}){
  return (<ScrollView>
    <SettingsHeader back>{title}</SettingsHeader>

      <View>
        <ProductPick name="Aucun" active={!currentName} online onPress={()=>onChange("")}/>
        {(currentName && (products.findIndex(p=> p.name === currentName) === -1))? <ProductPick name={currentName} address={"déconnecté"} online={false} active/> : null}
        {products.map(p=>(<ProductPick
          key={p.name}
          name={p.name}
          address={p.url}
          active={currentName===p.name}
          online
          onPress={()=>onChange(p.name)}
        />))}
      </View>

  </ScrollView>)
}

export default function PickProductScreen({route}){
  const default_target = useSelector((state)=> state.conf.default_target);
  const target = useSelector(getActiveProduct);
  const products = useSelector((state)=> state.products);
  const dispatch = useDispatch();
  const mode = route.params["t"] || "default";
  const title = (mode == "default")? "Cible automatique": "Connexion au produit"

  const handleChange = (name)=>{
    if(mode === "default"){
      dispatch(setDefaultTarget(name));
    }else if(mode==="target"){
      dispatch(setActive(name));
    }else{
      dispatch(warn("PickProduct", `Mode inconnu : ${mode}`));
    }
  }
  let currentName;
  if(mode === "default"){
    currentName= default_target;
  }else if(mode === "target"){
    currentName = target? target.name : null;
  }
  return (<ProductPicker 
    onChange={handleChange} 
    title={title} 
    currentName={currentName} 
    products={products}
  />)
}