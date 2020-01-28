import React from 'react'
import PropTypes from "prop-types";
import { View, Text, Content } from 'native-base';
import { ImageBackground, StyleSheet, Dimensions } from 'react-native';

import Buttons from "./Buttons";


const {width, height} = Dimensions.get('window');


export default function ObjectView({navigation, ...d}){

    const source = ((d && d.image)?{uri: d.image}: require("../../assets/missing-image.png"));
    return(<ImageBackground source={source} style={{width, height: height-70}} >
        <Buttons style={{borderWidth:0}} items={d["links"] || []} onPress={(id)=>navigation.push("Object", {id})}/>
    </ImageBackground>)
}
ObjectView.propTypes = {
    navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({

})