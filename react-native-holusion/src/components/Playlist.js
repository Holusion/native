import RNFS from 'react-native-fs';

import * as network from '../utils/Network';

export default class Playlist {

    constructor(url, contents) {
        this.playlist = contents;

        if(!contents || !(contents instanceof Array)) {
            isNetworkContents = true;
            this.playlist = network.getPlaylist(url);
        }
        
        this.playlist = this.playlist.map((elem) => {
            elem.imageUri = `file://${RNFS.DocumentDirectoryPath}/${elem.name}.jpg`;
            if(!elem.localImage) {
                elem.imageUri = `http://${url}:3000/medias/${elem.name}?thumb=true`;
            }
            if(!elem.title) {
                elem.title = elem.name;
            }
            return {url, ...elem};
        });
    }
}