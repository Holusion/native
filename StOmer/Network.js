'use strict';
import React from 'react';
import { connect} from 'react-redux'
import Zeroconf from 'react-native-zeroconf';   

import {setProducts, setActive, setNetInfo} from "./src/actions";

import NetInfo from "@react-native-community/netinfo";

class Network extends React.Component {
  constructor(props){
    super(props);
    this.netInfoHandler = ({type})=>{
      this.props.setNetInfo(["none", "unknown"].indexOf(type) == -1 ? "online" : "offline")
    }
  }
  componentDidMount(){
    const unsubscribe = NetInfo.addEventListener("connectionChange", this.netInfoHandler);
    const zeroconf = new Zeroconf();
    this.products = [];
    zeroconf.scan('workstation', 'tcp', 'local.');
    zeroconf.on('resolved', (service) => {
        let obj = {
            name: service.name,
            url: service.addresses
        }
        this.props.setProducts([obj].concat(this.props.products));
      //Give some time for other products to be detected, too
      setTimeout(()=>{
        if(this.props.products.length == 1 && !this.props.active){
          this.props.setActive(this.props.products[0])
        }
      },100)
    });
    zeroconf.on('remove', (name) => {
      console.warn("Product disconnected : ", name);
      this.props.setProducts(this.state.products.filter(elem => elem.name != name));
    });
    zeroconf.on('error', err => {
      //FIXME error 
      console.error(err);
    });

    this.zeroconf = zeroconf;
    this.close = ()=>{
      zeroconf.stop();
      zeroconf.removeDeviceListeners();
      this.props.setProducts([]);
      unsubscribe();
    }
  }
  componentWillUnmount(){
    this.close();
  }
  render(){
    return null;
  }
}

function mapStateToProps(state){
  const {products} = state;
  return {products, active: products.find(p => p.active)};
}

export default connect(mapStateToProps, {setProducts, setActive, setNetInfo})(Network);