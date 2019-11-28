import React, {useEffect} from "react";
import PropTypes from "prop-types";

import { Container, Content, H1, H2, View, Text, Spinner } from 'native-base';
import { StyleSheet, Dimensions } from 'react-native';

import {connect} from "react-redux";
import {getSelectedItem} from "@holusion/react-native-holusion/lib/selectors";
import {filename} from "@holusion/react-native-holusion/lib/files";
import {objectScreenVithView} from "@holusion/react-native-holusion/lib/screens/ObjectScreen";



/**
 * Object screen is the screen that render a carousel of the current collection. You can swipe to change the current object or touch the next or previous button
 */
function QuestionScreen(props){
    const item = props.item || {};

    
    useEffect(()=>{
        if(! props.navigation){
            console.warn("No navigation given to questionScreen");
            return ()=>{};
        }else if(!item.duration){
            console.warn("item has no duration");
            return ()=>{};
        }else if(Number.isNaN(item.duration)){
            console.warn("Item duration is not a number");
            return ()=>{};
        }
        const t = setTimeout(()=>{
            props.navigation.navigate("Home");
        }, item.duration*1000);
        return clearTimeout.bind(null, t);
    });
    
    useEffect(()=>{
        const abortController = new AbortController();        
        if(props.item && props.item.video && props.target){
            console.warn("set current : ", filename(props.item.video))
            fetch(`http://${props.target.url}/control/current/${filename(props.item.video)}`, {method: 'PUT', signal: abortController.signal})
            .then(r=>{
                if(!r.ok){
                    Toast.show({
                        text: "Failed to set current : "+r.status,
                        duration: 2000
                    })
                }
            })
        }
        return ()=> abortController.abort();
    });
    return (<Container style={styles.container}>
        <Content contentContainerStyle={styles.content}>
            <View style={styles.titleContainer}>
                <H1 style={styles.title}>Je me demandais...</H1>
            </View>
            <View style={styles.bottomContainer}>
                <View style={styles.questionContainer}>
                    <H2 style={styles.question}>{item["title"]}</H2>
                </View>
            </View>
        </Content>
    </Container>)
}

function mapStateToProps(state, {navigation}){
    const {data, products} = state;
    const item = getSelectedItem(state, {selectedId: navigation.getParam("id")});
    return {
        item,
        target: products.find(p => p.active)
    };
}

const styles = StyleSheet.create({
    container:{
        backgroundColor: "black",
    },
    content:{
        flexDirection:"column",
        height: "100%",
    },
    titleContainer: {
        flex:1,
        padding: 10,
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
    },
    title: {
        textAlign: "center",
        color: "white",
        fontFamily: "Oswald",
        lineHeight: 60,
    },
    bottomContainer:{
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
    },
    questionContainer:{
        alignSelf: "center",
        width:"80%",
        borderLeftWidth: 30,
        padding : 20,
        borderColor: "#034EA2FF",
    },
    question: {
        color: "white",
        textAlign: "center",
        lineHeight: 60
    },
})

const QuestionScreenConnected = connect(mapStateToProps)(QuestionScreen);

export default QuestionScreenConnected;