import RNFS from 'react-native-fs';

import * as network from '../utils/Network';

export default class Playlist {

    constructor(url, contents=null, localImage=false, customTitles = []) {
        let isNetworkContents = false;
        this.playlist = contents;

        if(!contents) {
            isNetworkContents = true;
            this.playlist = network.getPlaylist(url);
        }
        
        this.playlist = this.playlist.map((elem, index) => {
            let elemName = isNetworkContents ? elem.name : elem;

            let imageUri = `http://${url}:3000/medias/${elemName}?thumb=true`;
            if(localImage) {
                imageUri = `file://${RNFS.DocumentDirectoryPath}/${elemName}.jpg`;
            }
            let title = elemName;
            if(customTitles.length != 0 && customTitles[index]) {
                title = customTitles[index];
            }
            return isNetworkContents ? {url, imageUri, title, ...elem} : {url, imageUri, title, elem};
        });
    }
}