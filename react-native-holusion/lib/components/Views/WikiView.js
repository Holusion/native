import React from 'react'

import { Content, H1, H2, View, Spinner } from 'native-base';
import { Image, StyleSheet } from 'react-native';

import Markdown from '../Markdown'

export default function WikiView(d){
    if(!d.active){
        return(<Content contentContainerStyle={styles.content}>
            <H1 style={styles.title}>{d['title']}</H1>
            <H2  style={styles.subTitle}>{d['subtitle']}</H2>
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}><Spinner primary/></View>
        </Content>)
    }
    let abstract = null;
    if(d["abstract"]){
        abstract= (<Markdown style={{body:{fontSize:26}}}>{d['abstract']}</Markdown>)
    }
    return(<Content contentContainerStyle={styles.content}>
        <View style={styles.headerStyles}>
            <View style={styles.titleContainer}>
                <View style={styles.titles}>
                    <H1 primary style={styles.title}>{d['title']}</H1>
                    <H2 style={styles.subTitle}>{d['subtitle']}</H2>
                    {abstract}
                </View>
            </View>
            <View style={styles.cartouche}>
                <Image source={{uri: `${d["thumb"]}`}} style={styles.image}/>
                {d['description'] && <Markdown >{d['description']}</Markdown>}
            </View>
        </View>
        {d['mainText'] && <View style={styles.textContent}>
            <H2 style={styles.subTitle}>Plus d'informations</H2>
            <Markdown>
                {d['mainText']}
            </Markdown>
        </View>}
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
    headerStyles: {
        flexDirection:"row"
    },
    textContent: {
        paddingTop: 0,
        marginTop: -40,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
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
        color: "#bbbbbb",
        fontStyle: "italic",
        paddingTop: 12,
    },    
})