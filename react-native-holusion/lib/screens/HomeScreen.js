import React from 'react';

import {setData} from '../actions';
import {getActiveItems} from "../selectors";
import { connect} from 'react-redux';

import { Container, Toast, Content, Footer, Spinner, Text, H1, View, Button} from 'native-base';
import { StyleSheet, TouchableOpacity} from 'react-native';


import {initialize} from "../files";

import ImageCard from '../components/ImageCard';

import * as strings from "../strings.json";

class HomeScreen extends React.Component {
    render() {
        if(this.state.status == "loading"){
            return(<Container><Content contentContainerStyle={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
               <Spinner/> 
                <Text>Loading...</Text>
            </Content></Container>)
        }
        const cards = this.props.categories.map((c, index)=>{
            return (<TouchableOpacity key={index} onPress={()=>this.props.navigation.navigate("List", {category: c})}>
                <ImageCard title={c} />
            </TouchableOpacity>)
        })

        let footer;
        if(this.props.config.about){
            footer = (<Footer >
                <Button transparent onPress={()=>this.props.navigation.navigate("About")}>
                    <Text style={styles.footerButton}>{strings.home.footerButton}</Text>
                </Button>
                    
            </Footer>)
        }
        return (
            <Container style={{flex: 1}}>
                <Content contentContainerStyle={styles.container}>
                    <View>
                        <H1 primary style={styles.titleContainer}>
                            Touchez-moi pour découvrir nos collections :
                        </H1>
                    </View>
                    <View style= {styles.cardContainer}>
                        {cards}
                    </View>
                </Content> 
                {footer}
            </Container>
        )
    }

    constructor(props) {
        super(props);

        this.state= {status:"loading"};
        //FIXME bad design...
        this.props.navigation.addListener("willFocus",()=>{
            if(this.state.status == "loading" ){
                this.load();
            }
        })
    }
    load(){
        if(0 < this.props.categories.length ){
            return this.setState({status: "done"})
        }
        this.setState({status: "loading"});
        initialize(this.props.projectName)
        .then(data=>{
            this.props.setData(data);
            this.setState({status: "done"});
        })
        .catch((err)=>{
            this.props.navigation.navigate("Update",{error: "Application configuration is required : "+err.toString()});
        });
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        flexDirection:"column",
        alignContent: "space-around",
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
        textAlign:'center',
        paddingVertical: 70,
    },
    cardContainer: {
        flex: 1,
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
        fontSize: 28
    }
});

function mapStateToProps(state){
    const {data } = state;
    const {config, projectName} = data;
    const categories = config.categories || [];
    return {categories, projectName, config};
}
export default connect(mapStateToProps, {setData})(HomeScreen);