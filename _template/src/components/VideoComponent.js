import React from 'react';
import {View} from 'react-native';
import Video from 'react-native-video';

export default class VideoComponent extends React.Component {

    state = {
        rate: 1
    };

    renderVideo() {
        return (
            <Video 
                source={{uri: this.props.uri}}
                style={this.props.style}
                muted={true}
                repeat={true}
                resizeMode={"contains"}
                ignoreSilentSwitch={"obey"}
            />
        )
    }

    render() {
        return (this.renderVideo())
    }

    constructor(props, context) {
        super(props, context);
    }
}