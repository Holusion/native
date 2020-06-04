import React from 'react'

import { Container, Content, Footer, Body, Header, H1, H2, View, Text, Row, Icon, Toast, Button, Spinner } from 'native-base';
import { Image, StyleSheet, ImageBackground } from 'react-native';

import Markdown from '../components/Markdown';
import LinksView from './LinksView';

export default function ObjectView(d){
    if(!d.active){
        return(<Content contentContainerStyle={styles.content}>
            <H1 style={styles.title}>{d['title']}</H1>
            <H2  style={styles.subTitle}>{d['subtitle']}</H2>
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}><Spinner primary/></View>
        </Content>)
    }
    const source = ((d && d.image)?{uri: d.image}: require("../../assets/missing-image.png"));
    const withDescription = d['description']?true:false;

    return(<Container style={{flex:1, display:"flex", flexDirection:"row", justifyContent:"space-evenly"}}>
        <View style={styles.image}>
            <ImageBackground resizeMode= 'contain' source={source} style={{width: '100%', height: '100%'}} >
                <H1 primary style={styles.title}>{d["title"]}</H1>
                <H2 secondary style={styles.subtitle}>{d["subtitle"]}</H2>
                <LinksView items={d["links"] || []} onPress={(id)=>d.navigation.push("Object", {id})}/>
            </ImageBackground>
        </View>
        {withDescription && <Content contentContainerStyle={{}}>
            <View style={styles.contentView}>
                <Markdown style={styles.markdown}>{d['description']}</Markdown>
            </View>
            
        </Content>}
        
    </Container>)
}

const styles = StyleSheet.create({
    image:{
        flex: 2,
    },
    contentView:{
        flex: 1,
        zIndex: 1,
        padding: 10,
        paddingBottom: 80,
        backgroundColor: "#f1f1f1",
        minHeight:"100%",
    },
    title:{
        paddingTop: 30,
        paddingLeft: 10,
        width:"100%",
    },
    subtitle:{
        paddingLeft: 10,

    },
})