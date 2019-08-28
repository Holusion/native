'use strict';
import React from 'react';
import { connect} from 'react-redux'
import Zeroconf from 'react-native-zeroconf';   

import {setProducts} from "./src/actions";

class Network extends React.Component {
  constructor(props){
    super(props);
  }
  componentDidMount(){
    const zeroconf = new Zeroconf();
    this.products = [];
    zeroconf.scan('workstation', 'tcp', 'local.');
    zeroconf.on('resolved', (service) => {
        let obj = {
            name: service.name,
            url: service.addresses
        }
        setProducts([obj].concat(this.state.products));
    });
    zeroconf.on('remove', (name) => {
      setProducts(this.state.products.filter(elem => elem.name != name));
    });
    zeroconf.on('error', err => {
      //FIXME error 
      console.error(err);
    });

    this.zeroconf = zeroconf;
    this.close = ()=>{
      zeroconf.stop();
      zeroconf.removeDeviceListeners();
      setProducts([]);
    }
  }
  componentWillUnmount(){
    this.close();
  }
}

function mapStateToProps(state){
  const {products} = state;
  return {products};
}

export default connect(mapStateToProps, {setProducts})(Network);