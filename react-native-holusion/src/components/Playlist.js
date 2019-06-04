import RNFS from 'react-native-fs';

import * as network from '../utils/Network';

export const playlistFromContents = (url, contents) => {
    return contents.map(elem => createPlaylistItem(elem, url, elem.name, elem.title, `file://${RNFS.DocumentDirectoryPath}/${elem.name}.jpg`));
}

export const playlistFromNetwork = (url) => {
    return network.getPlaylist(url).map(elem => createPlaylistItem(elem, url, elem.name, elem.name, `http://${url}:3000/medias/${elem.name}?thumb=true`))
}

const createPlaylistItem = (elem, url, name, title, imageUri) => {
    return {
        url,
        name,
        title,
        imageUri,
        ...elem
    }
}
