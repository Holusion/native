import * as network from '../utils/Network'

export default class PlaylistItem {
    constructor(url, image, name, title) {
        this.url = url;
        this.image = image;
        this.name = name;
        this.title = title;
    }

    play() {
        network.play(url, name);
    }
}