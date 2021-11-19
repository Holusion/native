'use strict';
import Zeroconf from 'react-native-zeroconf';   

import {setProducts, addProduct, removeProduct, setActive, setNetInfo} from "@holusion/cache-control";

import NetInfo from "@react-native-community/netinfo";

export function onUpdate(store){
  const {conf:{default_target}, products, network} = store.getState();

  const isActive = products.find(p=>p.active)? true: false;
  if(!isActive && default_target ){
    const target_product = products.find(p => p.name === default_target);
    if(target_product){
      //console.log("dispatch new target product");
      store.dispatch(setActive(target_product));
    }
  }
}

export default function netScan(store){
  const unsubscribers = [];
  const netInfoHandler = ({type})=>{
    store.dispatch(setNetInfo(((["none", "unknown"].indexOf(type) == -1 )? "online" : "offline")));
  }
  const unsubscribe = NetInfo.addEventListener(netInfoHandler);
  unsubscribers.push(unsubscribe);

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
