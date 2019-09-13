import React from 'react';
import PropTypes from 'prop-types';
import {setData} from '../actions';
import {getActiveItems} from "../selectors";
import { connect} from 'react-redux';

import { Container, Toast, Content, Footer, Spinner, Text, View} from 'native-base';
import { StyleSheet, TouchableOpacity} from 'react-native';


import {initialize} from "../files";

import ImageCard from '../components/ImageCard';

import * as strings from "../strings.json";

function ListScreenContent(props){
    const cards = props.items.map(item =>{
        //Ugly hack because Images with a file:/// uri are not rendered when updated unless we restart the app
        const thumbSource = item['thumb']? {uri: item['thumb'].replace(/file:\/\/\/.*\/Documents/,"~/Documents"), scale: 1} : require("../../assets/icons/catalogue.png");
        return (<TouchableOpacity key={item['id']} onPress={()=>props.onNavigate(item['id'])}>
                <ImageCard source={thumbSource} title={item.title} />
        </TouchableOpacity>)
    })
    return(<Content contentContainerStyle={styles.container}>
        <View style={styles.titleContainer}>
            <Text >
            </Text>
        </View>
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

export default class ListScreen extends React.Component {
    render() {
        return (
            <Container style={{flex: 1}}>
                <ConnectedListScreenContent 
                selectedCategory={this.props.navigation.getParam("category")}
                onNavigate={(id) => this.props.navigation.navigate("Object", {id})}
                />

                <Footer onPress={()=>this.props.navigation.navigate("Remerciements")}>
                    <Text style={styles.footerButton}>{strings.home.footerButton}</Text>
                </Footer>
            </Container>
        )
    }

    constructor(props) {
        super(props);
    }
}


const styles = StyleSheet.create({
    titleContainer: {
        flex: 1,
        display: "flex",
        justifyContent: 'center',
        alignItems: 'center'

    },
    cardContainer: {
        flex: 2,
        display: 'flex', 
        flexWrap: "wrap",
        flexDirection: "row", 
        alignContent: 'center', 
        justifyContent: 'center'
    },
    footerContainer: {
        display: 'flex', 
        justifyContent: 'center', 
        flexDirection: 'row',
        borderRadius: 8, 
        padding: 8, 
        shadowOffset: {
            width: 0, 
            height: 10
        }, 
        shadowOpacity: 0.8, 
        shadowRadius: 10,
        width: "90%",
        position: "absolute",
        bottom: 32
    },
    footerButton: {
        color: 'white', 
        fontSize: 28
    }
});
