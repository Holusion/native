import Zeroconf from 'react-native-zeroconf';

const zeroconf = new Zeroconf();

let allProducts = [];

export const manage = (callbackAdd, callbackRemove) => {
    try {
        zeroconf.scan('workstation', 'tcp', 'local.');
        zeroconf.on('resolved', (service) => {
            let obj = {
                name: service.name,
                url: service.addresses
            }
            allProducts.push(obj);
            if(callbackAdd) {
                callbackAdd();
            }
        });
        zeroconf.on('remove', (name) => {
            allProducts = allProducts.filter(elem => elem.name != name);
            if(callbackRemove) {
                callbackRemove();
            }
        });
    } catch(e) {
    
    }
}

export const getUrl = () => {
    return allProducts[0].url[0];
}
