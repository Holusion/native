export const getPlaylist = async (url) => {
    try {
        let res = await fetch(`http://${url}:3000/playlist`);
        return res.json();
    } catch(err) {
        console.error('Something wrong when get playlist at ' + url);
    }
}

export const desactivateAll = async (url) => {
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
        console.error("Something wrong when deactivate all at " + url);
    }
}

export const play = async (url, name) => {
    fetch(`http://${url}:3000/control/current/${name}.mp4`, {
        method: 'PUT'
    });
}