'use strict';
import React from "react";
import PropTypes from "prop-types"
import {Icon, Text} from "native-base";
import {TouchableOpacity} from "react-native";

export function LinksView(props){
    const buttons = (props.items || []).map((item, index)=>{
        const color = item.color || "#333333ff";
        const fontSize = 24;
        const textAlign = "center";
        const style = {
            position: "absolute",
            display: "flex",
            padding:4,
            flex: 1,
            maxWidth: 250,
            alignItems : "center",
            flexDirection: "row",
            justifyContent: "center",
            borderColor: color,
            borderWidth: 2,
            borderRadius: 4,
            left: (typeof item.x == "number")? item.x : parseInt(item.x),
            top: (typeof item.y == "number")? item.y : parseInt(item.y)
        }

        return (<TouchableOpacity key={index} style={style} onPress={()=> props.onPress(item.name)}>
            <Icon name="zoom-in" type="MaterialIcons" style={{color, fontSize}}></Icon>
            <Text style={{color, fontSize, textAlign}} numberOfLines={2}>{item.title || item.name}</Text>
        </TouchableOpacity>)
    })
    return (<React.Fragment>
        {buttons}
    </React.Fragment>)
}

LinksView.propTypes = {
    items: PropTypes.array.isRequired,
    onPress: PropTypes.func.isRequired,
}