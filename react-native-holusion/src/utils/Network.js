import Zeroconf from 'react-native-zeroconf';

const zeroconf = new Zeroconf();
let allProducts = [];

export const connect = (callbackAdd, callbackRemove) => {
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
    if(allProducts.length > 0) {
        return allProducts[0].url[0];
    }
    return null;
}

export const getPlaylist = async (url) => {
    try {
        let res = await fetch(`http://${url}:3000/playlist`);
        return res.json();
    } catch(err) {
        console.error('Something wrong when get playlist at ' + url);
    }
}

export const desactiveAll = async (url) => {
    let playlist = await getPlaylist(url);
    playlist.filter(o => o.active == true).forEach(elem => {
        try {
            fetch(`http://${url}:3000/playlist`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: elem.name,
                    rank: elem.rank,
                    path: elem.path,
                    active: false
                })
            });
        } catch(error) {
            console.error("Something wrong when deactivate all at " + url);
        }
    })
}

export const activeAll = async (url) => {
    let playlist = await getPlaylist(url);
    playlist.filter(o => o.active == false).forEach(elem => {
        try {
            fetch(`http://${url}:3000/playlist`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: elem.name,
                    rank: elem.rank,
                    path: elem.path,
                    active: true
                })
            });
        } catch(error) {
            console.error("Something wrong when deactivate all at " + url);
        }
    })
}

export const active = async (url, name) => {
    let playlist = await getPlaylist(url);
    playlist = playlist.filter(o => o.name == name)
    try {
        fetch(`http://${url}:3000/playlist`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: playlist[0].name,
                rank: playlist[0].rank,
                path: playlist[0].path,
                active: true
            })
        });
    } catch(error) {
        console.error("Something wrong when activation at " + url);
    }
}

export const play = async (url, name) => {
    fetch(`http://${url}:3000/control/current/${name}`, {
        method: 'PUT'
    });
}
