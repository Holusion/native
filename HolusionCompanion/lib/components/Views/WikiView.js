import React from 'react'

import { Image, StyleSheet, View, ScrollView } from 'react-native';

import { H1, H2 } from '../style'

import Markdown from '../Markdown'

export default function WikiView(d){
    let abstract = null;
    if(d["abstract"]){
        abstract = (<Markdown style={{body:{fontSize:26}}}>{d['abstract']}</Markdown>)
    }
    return(<ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerStyles}>
            <View style={styles.titleContainer}>
                <View style={styles.titles}>
                    <H1 style={styles.title}>{d['title']}</H1>
                    <H2 style={styles.subTitle}>{d['subtitle']}</H2>
                    {abstract}
                </View>
            </View>
            <View style={styles.cartouche}>
                <Image source={d["thumb"]?{uri: `${d["thumb"]}`}: require("../../../assets/missing-image.png")} style={styles.image}/>
                {d['description'] && <Markdown >{d['description']}</Markdown>}
            </View>
        </View>
        {d['mainText'] && <View style={styles.textContent}>
            <H2 style={styles.subTitle}>Plus d'informations</H2>
            <Markdown>
                {d['mainText']}
            </Markdown>
        </View>}
    </ScrollView>)
}

const styles = StyleSheet.create({
    content: {
        marginHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 100,
    },
    image: {
        flex: 0,
        minHeight: 150,
        width: "100%",
        resizeMode: "contain",
    },
    headerStyles: {
        flexDirection:"row"
    },
    textContent: {
        paddingTop: 0,
        marginTop: -40,
    },
    titleContainer: {
        flex:2,
        display: "flex",
        flexDirection: "column",
        justifyContent:"space-between",
        paddingBottom: 50,
    },
    titles: {
        flex: 2,
        display: "flex",
        justifyContent: "flex-start",
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
        fontStyle: "italic",
        paddingVertical: 12,
    },    
})