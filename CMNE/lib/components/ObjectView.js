import React from 'react'

import { View, Text,  } from 'native-base';
import { ImageBackground, StyleSheet, Dimensions } from 'react-native';

import Buttons from "./Buttons";


const {width, height} = Dimensions.get('window');


export default function ObjectView(d){
    if(!d.active){
        return(<Content contentContainerStyle={styles.content}>
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}><Spinner primary/></View>
        </Content>)
    }

    const source = ((d && d.image)?{uri: d.image}: require("../../assets/missing-image.png"));

    return(<ImageBackground source={source} style={{width, height:height-70}} >
        <Buttons items={d["links"] || []} onPress={(id)=>this.props.navigation.push("GroupView", {id})}/>
    </ImageBackground>)
}

const styles = StyleSheet.create({

})