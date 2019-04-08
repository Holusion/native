import * as network from '../utils/Network'

export default class PlaylistItem {
    constructor(url, image, name) {
        this.url = url;
        this.image = image;
        this.name = name;
    }

    play() {
        network.play(url, name);
    }
}