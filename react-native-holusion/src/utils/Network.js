import Zeroconf from 'react-native-zeroconf';   

let allProducts = [];

export default class Network{
    constructor(){
        const zeroconf = new Zeroconf();
        this.products = [];
        this.close = ()=>{
            zeroconf.stop();
            zeroconf.removeDeviceListeners();
            this.products = [];
        }

        zeroconf.scan('workstation', 'tcp', 'local.');
        zeroconf.on('resolved', (service) => {
            let obj = {
                name: service.name,
                url: service.addresses
            }
            this.products.push(obj);
        });
        zeroconf.on('remove', (name) => {
            this.products = this.products.filter(elem => elem.name != name);
        });
        zeroconf.on('error', err => {
            this.emit("error", err);
        });
    }
}


export const hasInternetConnection = async () => {
    let res = await fetch("https://holusion.com")
    if(res.status !== 200) {
        return false;
    }
    return true;
}

export const getUrls = () => {
    return allProducts.map(e => e.url)
}

export const getUrl = (id) => {
    let urls = getUrls();
    if(urls.length > 0) { return urls[id][0]; }
    return null;
}

const playlistPutActive = async (url, elem, active) => {
    const json = {
        name: elem.name,
        rank: elem.rank,
        path: elem.path,
        active: active
    };
    
    const res = await fetch(`http://${url}:3000/playlist`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json)
    });
}

/**
 * give the playlist from a product given by its url
 * activeWithPredicate, desactiveAll, desactive, activeAll, active, activeOnlyYamlItems will thrown same error too
 * @param {string} url url product 
 * @throws {TypeError} Network request failed -> when application disconnected from product
 */
export const getPlaylist = async (url) => {
    let res = await fetch(`http://${url}:3000/playlist`);
    if(res.status === 204) {
        return []
    }
    return res.json();
}

export const desactiveAll = async (url) => {
    return await activeWithPredicate(url, elem => elem.active, false);
}

export const desactive = async (url, name) => {
    return await activeWithPredicate(url, elem => elem.name == name, false);
}

export const activeAll = async (url) => {
    return await activeWithPredicate(url, elem => !elem.active, true);
}

export const active = async (url, name) => {
    return await activeWithPredicate(url, (elem) => elem.name == name, true);
}

export const activeWithPredicate = async (url, predicate, active) => {
    let playlist = await getPlaylist(url);
    let ops = Promise.all(
        playlist.filter(elem => predicate(elem)).map(async elem => {
            try {
                return await playlistPutActive(url, elem, active);
            } catch(err) {
                return new Error(`${elem.name} is not accessible`);
            }
        })
    )
    return (await ops).filter(elem => elem instanceof Error);
}

export const activeOnlyYamlItems = async (url, yamlFiles) => {
    return await activeWithPredicate(url, (elem) => {
        let name = elem.name.split('.')[0];
        return yamlFiles[name];
    }, true)
}

export const play = async (url, name) => {
    await fetch(`http://${url}:3000/control/current/${name}`, {
        method: 'PUT'
    });
}
