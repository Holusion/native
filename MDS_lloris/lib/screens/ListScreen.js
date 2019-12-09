import React from 'react';
import PropTypes from 'prop-types';
import { connect} from 'react-redux';

import { Container, Toast, Content, Footer, Spinner, Text, View} from 'native-base';
import { StyleSheet, TouchableOpacity, ImageBackground} from 'react-native';


import {initialize, filename} from "@holusion/react-native-holusion/lib/files";
import {setData} from '@holusion/react-native-holusion/lib/actions';
import {getActiveItems, getActiveProduct} from "@holusion/react-native-holusion/lib/selectors";

import UserInactivity from 'react-native-user-inactivity';

import * as strings from "@holusion/react-native-holusion/lib/strings.json";

function sortItems({rank:a}, {rank:b}){
    if(a < b){
        return -1
    }else if(b < a){
        return 1
    }else{
        return 0
    }
}

function ListScreenContent(props){
    console.warn("Category items : ", props.items);
    const cards = props.items.sort(sortItems).map(item =>{
        //Ugly hack because Images with a file:/// uri are not rendered when updated unless we restart the app
        const thumbSource = item['thumb']? {uri: item['thumb'].replace(/file:\/\/\/.*\/Documents/,"~/Documents"), scale: 1} : require("@holusion/react-native-holusion/assets/icons/catalogue.png");
        return (<TouchableOpacity key={item['id']} onPress={()=>props.onNavigate(item['id'])} style={styles.card}>
                <ImageBackground source={thumbSource} style={styles.cardImage}>
                    <Text style={styles.cardText}>{(item['title'] || item['id']).toUpperCase()}</Text>
                </ImageBackground>
        </TouchableOpacity>)
    })
    return(<Content contentContainerStyle={styles.content}>
        <View style= {styles.cardContainer}>
            {cards}
        </View>
    </Content> )
}
ListScreenContent.propTypes = {
    selectedCategory: PropTypes.string,
    onNavigate: PropTypes.func,
}

const ConnectedListScreenContent = connect(function(state, props){
    return {
        items: getActiveItems(state, props)
    }
})(ListScreenContent);

class ListScreen extends React.Component {
    render() {
        return (<UserInactivity timeForInactivity={40000} onAction={()=>this.onInactive()}>
            <Container style={{flex: 1, padding: 0}}>
                <ImageBackground source={require("../../assets/02_Background.png")} style={{width:"100%", height:"100%"}}>
                    <ConnectedListScreenContent 
                    selectedCategory={this.props.navigation.getParam("category")}
                    onNavigate={(id) => this.props.navigation.navigate("Object", {id, category: this.props.navigation.getParam("category")})}
                    />
                </ImageBackground>
            </Container>
            </UserInactivity>)
    }
    onInactive(){
        if(this.props.navigation.isFocused()){
            this.props.navigation.navigate("Home");
        }
    }
    onFocus(){
        if(this.props.config&& this.props.config.video && this.props.target){
            fetch(`http://${this.props.target.url}/control/current/${filename(this.props.config.video)}`, {method: 'PUT'})
            .then(r=>{
                if(!r.ok){
                    Toast.show({
                        text: "Failed to set current : "+r.status,
                        duration: 2000
                    })
                }
            })
        }
    }
    componentDidMount(){
        this.subscription = this.props.navigation.addListener("willFocus",()=>{
            this.onFocus();
        })
    }
    componentWillunmount(){
        this.subscription.remove();
    }
    constructor(props) {
        super(props);
    }
}

export default connect(function(state, props){
    const {data} = state;
    return {
        config: data.config,
        target: getActiveProduct(state)
    }
})(ListScreen);

const styles = StyleSheet.create({
    content:{
        paddingTop: 110,
        paddingLeft: 25,
        paddingRight: 0,
    },
    cardContainer: {
        padding: 0,
    },
    card: {
        padding: 12.5,
    },
    cardImage:{
        height:160/2,
        width: 1472/2,
        resizeMode: "contain",
        paddingLeft: 110,
        flexDirection: "column",
        alignContent: "center",
    },
    cardText:{
        flex:1,
        fontSize: 30,
        lineHeight: 80,
        color: "white",
        fontFamily: "Oswald",
    }
});
