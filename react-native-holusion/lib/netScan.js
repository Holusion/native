'use strict';
import Zeroconf from 'react-native-zeroconf';   

import {setProducts, addProduct, removeProduct, setActive, setNetInfo} from "./actions";

import NetInfo from "@react-native-community/netinfo";

export function onUpdate(store){
  const {data, products, network} = store.getState();
  const {config} = data;
  const {default_target}= config;
  const isActive = products.find(p=>p.active)? true: false;
  //Give some time for other products to be detected, too
  if(!isActive && default_target ){
    const target_product = products.find(p => p.name == default_target);
    if(target_product){
      store.dispatch(setActive(target_product));
    }
  }
}

export default function netScan(store){
  const unsubscribers = [];
  const netInfoHandler = ({type})=>{
    store.dispatch(setNetInfo(((["none", "unknown"].indexOf(type) == -1 )? "online" : "offline")));
  }
  NetInfo.addEventListener("connectionChange", netInfoHandler)
  unsubscribers.push(()=>NetInfo.removeEventListener("connectionChange", netInfoHandler));

  const zeroconf = new Zeroconf();
  zeroconf.scan('workstation', 'tcp', 'local.');

  zeroconf.on('resolved', (service) => {
    let obj = {
        name: service.name.split(" ")[0],
        url: service.addresses[0]
    }
    store.dispatch(addProduct(obj));
  });
  zeroconf.on('remove', (name) => {
    store.dispatch(removeProduct(name));
  });
  zeroconf.on('error', err => {
    console.warn("Zeroconf error :", err);
  });
  unsubscribers.push(()=>{zeroconf.stop();zeroconf.removeDeviceListeners();})

  
  unsubscribers.push(store.subscribe(()=>onUpdate(store)));
  


  return ()=>{
    unsubscribers.forEach((fn, idx)=>{
      try{
        fn();
      }catch(e){
        console.warn("Failed to unsubscribe to ", idx, e.toString());
      }
    })
    store.dispatch(setProducts([]));
  }
}
