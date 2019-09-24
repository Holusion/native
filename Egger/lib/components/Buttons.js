'use strict';
import React from "react";
import PropTypes from "prop-types"
import {Icon, Text} from "native-base";
import {TouchableOpacity} from "react-native";

export default function Buttons(props){
    const buttons = (props.items || []).map((item)=>{
        const color = item.color || "#333333ff"
        const fontSize = 24;
        const style = {
            position: "absolute",
            display: "flex",
            padding:4,
            flex: 1,
            width: 250,
            flexDirection: "row",
            borderColor: color,
            borderWidth: 1,
            borderRadius: 1,
            left: (typeof item.x == "number")? item.x : parseInt(item.x),
            top: (typeof item.y == "number")? item.y : parseInt(item.y)
        }

        return (<TouchableOpacity key={item.id} style={style} onPress={()=> props.onPress(item.name)}>
            <Icon name="zoom-in" type="MaterialIcons" style={{color, fontSize}}></Icon>
            <Text style={{color, fontSize}} numberOfLines={2}>{item.name}</Text>
        </TouchableOpacity>)
    })
    return (<React.Fragment>
        {buttons}
    </React.Fragment>)
}

Buttons.propTypes = {
    items: PropTypes.array.isRequired,
    onPress: PropTypes.func.isRequired,
}