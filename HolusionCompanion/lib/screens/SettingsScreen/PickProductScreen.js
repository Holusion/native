import { getActiveProduct, setActive, setDefaultTarget, warn } from "@holusion/cache-control";
import { Body, Container, Content, Icon, Item, Left, List, ListItem, Picker, Right, Text } from "native-base";
import React from "react"
import { useDispatch, useSelector } from "react-redux";
import { BgIcon } from "../../components";
import SettingsHeader from "./SettingsHeader";



export function ProductPick({name, address, active, online, onPress}){
  let iconColor;
  if(!online){
    iconColor = "warning"
  }else if(active){
    iconColor = "info";
  }else{
    iconColor = "muted";
  }
  return ( <ListItem icon onPress={onPress}>
    <Left>
      <BgIcon status={iconColor} name="link"/>
    </Left>
    <Body><Text style={{color: BgIcon.colors[active?"default": "muted"] }}>{name}{address && ` (${address})`}</Text></Body>
    <Right><Icon style={{color: BgIcon.colors[active?"default": "muted"]}} name="checkmark"/></Right>
  </ListItem>)
}

export function ProductPicker({currentName, products, title="Choix de la cible", onChange}){
  return (<Container>
    <SettingsHeader back>{title}</SettingsHeader>
    <Content settings>
      <List>
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
      </List>
    </Content>
  </Container>)
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