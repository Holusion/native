import React from 'react';
import PropTypes from "prop-types";
import { Image } from "react-native";
import { connectStyle, Text, Icon, View } from 'native-base'


class ImageCard extends React.Component{
    static propTypes = {
        image: PropTypes.object,
        source: PropTypes.shape({uri: PropTypes.string}),
        title: PropTypes.string,
        style: PropTypes.object,
    }
    render() {
        const props = this.props;
        const styles = props.style;
        let img 
        if(props.image) img = props.image;
        else if(props.source) img = (<Image key={props.source.uri} style={styles.image} source={props.source} resizeMode="cover"/>);
        else img = (<Icon style={styles.icon} name="ios-image"/>);
        (typeof props.title == "string") || console.warn("Invalid title :", props.title);
        const title = (typeof props.title == "string")? props.title : "--";
        return (
            <View style={styles.container}>
                {img}
                <View style={styles.titleContainer}>
                    <Text ellipsizeMode="tail" numberOfLines={1} style={styles.titleText}>{title}</Text>
                </View>
            </View>
        );
    }
}

const cardTheme = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        margin: 20,
        padding: 0,
        borderRadius: 8,
        backgroundColor: "transparent",
        borderWidth: 1,
    },

    titleContainer: {
        marginLeft: 16,
        marginRight: 16,
        marginTop: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
    },

    image: {
        alignSelf: 'center', 
        width: 200, 
        height: 200, 
    },
    icon: {
        alignSelf: 'center', 
        fontSize: 200,
    },
    titleText: {
        width: 200,
        textAlign: 'center',
        fontSize: 26,
        alignSelf: 'center'
    }
}


export default connectStyle('Holusion.ImageCard', cardTheme)(ImageCard);
