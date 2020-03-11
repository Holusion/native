import React from 'react'

import { Container, Content, Footer, Body, Header, H1, H2, View, Text, Row, Icon, Toast, Button, Spinner } from 'native-base';
import { Image, StyleSheet } from 'react-native';

import Markdown from '../components/Markdown'

export default function WikiView(d){
    if(!d.active){
        return(<Content contentContainerStyle={styles.content}>
            <H1 style={styles.title}>{d['title']}</H1>
            <H2  style={styles.subTitle}>{d['subtitle']}</H2>
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}><Spinner primary/></View>
        </Content>)
    }

    return(<Content contentContainerStyle={styles.content}>
        <View style={{flexDirection:"row"}}>
            <View style={styles.titleContainer}>
                <H1 primary style={styles.title}>{d['title']}</H1>
                <H2 style={styles.subTitle}>{d['subtitle']}</H2>
                <Markdown style={{text:{fontSize:26}}}>{d['abstract']}</Markdown>
            </View>
            <View style={styles.cartouche}>
                <Image source={{uri: `${d["thumb"]}`}} style={styles.image}/>
                <Markdown >{d['description']}</Markdown>
            </View>
        </View>
        <View style={styles.textContent}>
            <H2 style={styles.subTitle}>Plus d'informations</H2>
            <Markdown>
                {d['mainText']}
            </Markdown>
        </View>
    </Content>)
}

const styles = StyleSheet.create({
    content: {
        marginHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 100,
    },
    image: {
        flex: 1,
        minHeight: 150,
        resizeMode: 'contain', 
    },
    textContent: {
        paddingTop: 24,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    titleContainer: {
        flex:2,
    },
    cartouche:{
        flex:1,
        justifyContent: "center",
        marginLeft: 40,
        paddingTop : 0,
        padding: 12,
        borderWidth : 1,
        borderColor : "#bbbbbb"
    },
    title: {
        lineHeight: 40,
    },
    subTitle: {
        color: "#bbbbbb",
        fontStyle: "italic",
        paddingTop: 12,
    },    
})