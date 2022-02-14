'use strict';
import {useDispatch, useSelector} from 'react-redux';
import { useEffect, useState } from 'react';

import Zeroconf from 'react-native-zeroconf';   

import {setProducts, addProduct, removeProduct, setActive, setNetInfo, getConf} from "@holusion/cache-control";

import NetInfo from "@react-native-community/netinfo";

import { useAppState } from './useAppState'; 

const getProducts = (state) => state.products;



/**
 * Internally manages the store's network state and product list
 */
export function useNetScan(){
  const dispatch = useDispatch();
  const {default_target} = useSelector(getConf);
  const products = useSelector(getProducts);
  const appState = useAppState();
  //Use isActive instead of appState to stay stable through inactive/background states
  const isActive = appState === "active";
  useEffect(()=>{
    if(!isActive) return;
    const unsubscribers = [];
    const netInfoHandler = ({type})=> dispatch(setNetInfo(((["none", "unknown"].indexOf(type) == -1 )? "online" : "offline")));
    unsubscribers.push(
      NetInfo.addEventListener(netInfoHandler)
    );
    //Initialize products list
    dispatch(setProducts([]));
    const zeroconf = new Zeroconf();
    zeroconf.scan('workstation', 'tcp', 'local.');
    unsubscribers.push(()=>{zeroconf.stop();zeroconf.removeDeviceListeners();})
    zeroconf.on('resolved', (service) => {
      let obj = {
          name: service.name.split(" ")[0],
          url: service.addresses[0]
      }
      dispatch(addProduct(obj));
    });
    zeroconf.on('remove', (name) => {
      dispatch(removeProduct(name));
    });
    zeroconf.on('error', err => {
      console.warn("Zeroconf error :", err);
    });

    return ()=>{
      unsubscribers.forEach((fn, idx)=>{
        try{ fn(); } catch(e) {
          console.warn("Failed to unsubscribe from ", idx, e.toString());
        }
      });
    }
  }, [dispatch, isActive]);

  useEffect(()=>{
    //This should probably be done in a saga inside the cache-control module
    const isActive = products.find(p=>p.active)? true: false;  
    if(!isActive && default_target ){
      const target_product = products.find(p => p.name === default_target);
      if(target_product){
        //console.log("dispatch new target product");
        dispatch(setActive(target_product));
      }
    }
  }, [default_target, products, dispatch]);
}
