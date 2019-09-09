import React from 'react';

import {setData} from '../actions';
import { connect} from 'react-redux';

import { Container, Toast, Content, Spinner, Text} from 'native-base';
import { StyleSheet, View, TouchableOpacity} from 'react-native';


import {loadFile} from "../files";

import Card from '../components/Card';

import * as strings from "../strings.json";

class HomeScreen extends React.Component {
    render() {
        if(this.state.status == "loading"){
            return(<Container><Content contentContainerStyle={{flex: 1, alignItems: 'center', justifyContent: 'center',}}>
               <Spinner/> 
                <Text>Loading...</Text>
            </Content></Container>)
        }
        const cards = this.props.cards.map((item)=>{
            return (<TouchableOpacity key={item['id']} onPress={()=>this.props.navigation.navigate("Object", {id:item['id']})}>
                <Card source={item['thumb']? {uri: item['thumb']} : require("../../assets/icons/catalogue.png")} title={item.title} />
            </TouchableOpacity>)
        })
        return (
            <Container style={{flex: 1}}>
                <View style={styles.container}>
                    <View style={styles.titleContainer}>
                        <Text >
                        </Text>
                    </View>
                    <View style= {styles.cardContainer}>
                        {cards}
                    </View>
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate("Remerciements")} style={styles.footerContainer}>
                        <View>
                            <Text style={styles.footerButton}>{strings.home.footerButton}</Text>
                        </View>
                    </TouchableOpacity>
                </View>  
            </Container>
        )
    }

    constructor(props) {
        super(props);

        this.state= {status:"loading"};
        this.props.navigation.addListener("willFocus",()=>{
            if(this.state.status == "loading" ){
                this.load();
            }
        })

    }
    load(){
        if(0 < this.props.cards.length ) return;
        this.setState({status: "loading"});
        loadFile("data.json")
        .then(data => JSON.parse(data))
        .then((data)=>{
            //console.warn("DATA : ", data);
            if(!data.items) throw new Error("Data is outdated");
            this.props.setData(data);
            this.setState({status:"done"});
        })
        .catch((err)=>{
            console.warn("LOAD ERROR", err);
            this.props.navigation.navigate("Update",{error: "Application configuration is required : "+err.toString()});
        });
    }
}

const customTheme = {
    'holusion.IconCardComponent': {
        container: {
            width: 300,
            height: 300,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
        },
        icon: {
            width: 300 * 0.6,
            height: 300 * 0.6
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex', 
        alignItems: 'center'
    },
    images: {
        width: null,
        height: 100,
        resizeMode: 'contain',
        alignSelf: 'flex-end',
        marginRight: 16
    },
    catchphrase: {
        fontSize: 48,
        textAlign: 'center'
    },
    titleContainer: {
        flex: 1,
        display: "flex",
        justifyContent: 'center',
        alignItems: 'center'

    },
    cardContainer: {
        flex: 2,
        display: 'flex', 
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

function mapStateToProps(state){
    const {target, data} = state;
    const cards = Object.keys(data.items).map((key)=>{
        return {id: key, thumb: data.items[key]["thumb"], title: data.items[key]['title']}
    })
    return {target, cards};
}
export default connect(mapStateToProps, {setData})(HomeScreen);