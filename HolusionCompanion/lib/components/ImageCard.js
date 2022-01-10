import React, { useContext } from 'react';
import { StyleSheet, Image, Text, View } from "react-native";
import { ThemeContext } from "./style"

function useThemedImageCard(){
    const theme = useContext(ThemeContext)

    return{
        container: {
            borderColor: theme.color.primary,
        },
        titleContainer: {
            backgroundColor: theme.color.primary,
        },
        titleText:{

        }
    }
}

export default function ImageCard(props){
    const themeStyle = useThemedImageCard()

    let img;
    if(props.image) img = props.image;
    else { 
        let src = (props.source)?props.source: require("../../assets/default_image.png");
        img = (<Image key={src.uri} style={cardStyle.image} source={src} resizeMode="cover"/>);
    }
    (typeof props.title == "string") || console.warn("Invalid title :", props.title);
    const title = (typeof props.title == "string")? props.title : "--";

    return (
        <View style={[cardStyle.container, themeStyle.container]}>
            {img}
            <View style={[cardStyle.titleContainer, themeStyle.titleContainer]}>
                <Text ellipsizeMode="tail" numberOfLines={1} style={[cardStyle.titleText, themeStyle.titleText]}>{title}</Text>
            </View>
        </View>
    );
}


const cardStyle = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        margin: 10,
        padding: 0,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "transparent",
        borderWidth: 1,
    },

    titleContainer: {
        alignSelf: "stretch",
        paddingHorizontal: 16,
        paddingVertical: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        width: 230,
    },

    image: {
        alignSelf: 'center',
        width: 230,
        height: 200, 
    },
    icon: {
        alignSelf: 'center', 
        fontSize: 200,
        width:200,
        height:200,
    },
    titleText: {
        textAlign: 'center',
        fontSize: 26,
        alignSelf: 'center',
        color: '#fff'
    }
})

