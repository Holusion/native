'use strict';
import React from "react";
import PropTypes from "prop-types"
import {Icon, Text} from "native-base";
import {TouchableOpacity, Image} from "react-native";

import {components} from "@holusion/react-native-holusion";
const {ImageCard} = components;


export default function Buttons(props){

    const style = Object.assign({
        position: "absolute",
        display: "flex",
        padding:4,
        flex: 1,
        maxWidth: 250,
        alignItems : "center",
        flexDirection: "row",
        justifyContent: "center",
        borderWidth: 2,
        borderRadius: 4,
    }, props.style);
    const buttons = (props.items || []).map((item, index)=>{
        const color = item.color? item.color : "#000000FF";
        const localStyle = {
            borderColor: color,
            left: (typeof item.x == "number")? item.x : parseInt(item.x),
            top: (typeof item.y == "number")? item.y : parseInt(item.y)
        };
        const fontSize = 24;
        const textAlign = "center";
        if(item.thumb){
            return (<TouchableOpacity key={index} style={[localStyle, style]} onPress={()=> props.onPress(item.name)}>
                <ImageCard source={{uri: item['thumb'].replace(/file:\/\/\/.*\/Documents/,"~/Documents"), scale: 1}} title={item.title? item.title : item.name} />
            </TouchableOpacity>)
        }else{
            return (<TouchableOpacity key={index} style={[localStyle, style]} onPress={()=> props.onPress(item.name)}>
                <Icon name="zoom-in" type="MaterialIcons" style={{color, fontSize}}></Icon>
                <Text style={{color, fontSize, textAlign}} numberOfLines={2}>{item.title || item.name}</Text>
            </TouchableOpacity>)
        }
    })
    return (<React.Fragment>
        {buttons}
    </React.Fragment>)
}

Buttons.propTypes = {
    items: PropTypes.array.isRequired,
    onPress: PropTypes.func.isRequired,
}