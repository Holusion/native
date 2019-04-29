import Zeroconf from 'react-native-zeroconf';

let allProducts = [];

export const connect = (callbackAdd, callbackRemove) => {
    const zeroconf = new Zeroconf();
    zeroconf.scan('workstation', 'tcp', 'local.');
    zeroconf.on('resolved', (service) => {
        let obj = {
            name: service.name,
            url: service.addresses
        }
        allProducts.push(obj);
        if(callbackAdd) {
            callbackAdd(service);
        }
    });
    zeroconf.on('remove', (name) => {
        allProducts = allProducts.filter(elem => elem.name != name);
        if(callbackRemove) {
            callbackRemove(name);
        }
    });
    zeroconf.on('error', err => {
        throw err;
    });

    return () => {
        zeroconf.stop();
        zeroconf.removeDeviceListeners();
    }
}

export const hasInternetConnection = async () => {
    try {
        let res = await fetch("https://holusion.com")
        if(res.status !== 200) {
            return false;
        }
        return true;
    } catch(err) {
        console.error(err);
        return false;
    }
}

export const getUrls = () => {
    return allProducts.map(e => e.url)
}

export const getUrl = (id) => {
    let urls = getUrls();
    if(urls.length > 0) { return urls[id][0]; }
    return null;
}

const playlistPutActive = (url, elem, active) => {
    fetch(`http://${url}:3000/playlist`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: elem.name,
            rank: elem.rank,
            path: elem.path,
            active: active
        })
    });
}

export const getPlaylist = async (url) => {
    try {
        let res = await fetch(`http://${url}:3000/playlist`);
        return res.json();
    } catch(err) {
        console.error('Something wrong when get playlist at ' + url + "\n" + err);
    }
}

export const desactiveAll = async (url) => {
    await activeWithPredicate(url, elem => elem.active, false);
}

export const desactive = async (url, name) => {
    await activeWithPredicate(url, elem => elem.name == name, false);
}

export const activeAll = async (url) => {
    await activeWithPredicate(url, elem => !elem.active, true);
}

export const active = async (url, name) => {
    await activeWithPredicate(url, (elem) => elem.name == name, true);
}

export const activeWithPredicate = async (url, predicate, active) => {
    let playlist = await getPlaylist(url);
    playlist.filter(elem => predicate(elem)).forEach(async elem => {
        try {
            playlistPutActive(url, elem, active);
        } catch(error) {
            console.error("Something wrong when activation at " + url);
        }
    });
}

export const activeOnlyYamlItems = (url, yamlFiles) => {
    activeWithPredicate(url, (elem) => {
        let name = elem.name.split('.')[0];
        return yamlFiles[name];
    }, true)
}

export const play = async (url, name) => {
    fetch(`http://${url}:3000/control/current/${name}`, {
        method: 'PUT'
    });
}
