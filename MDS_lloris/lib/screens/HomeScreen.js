import React from 'react';
import { connect } from 'react-redux';
import { Container, Toast, Content, Footer, Spinner, Text, H1, H2, View, Button} from 'native-base';
import { StyleSheet, TouchableOpacity, ImageBackground, Image} from 'react-native';


import {setData} from '@holusion/react-native-holusion/lib/actions';
import {getActiveItems, getActiveProduct} from "@holusion/react-native-holusion/lib/selectors";

import {initialize, signIn, watchFiles, filename} from "@holusion/react-native-holusion/lib/files";

import ImageCard from '@holusion/react-native-holusion/lib/components/ImageCard';

import * as strings from "@holusion/react-native-holusion/lib/strings.json";

class HomeScreen extends React.Component {
    render() {
        if(!this.props.config){
            return(<Container><ImageBackground src={require("../../assets/01_Background_PageAccueil.png")} style={{width:"100%", height: "100%"}}>
                <Content contentContainerStyle={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Spinner/> 
                    <Text>Loading...</Text>
                </Content>
            </ImageBackground></Container>)
        }
        let cards;
        if(this.props.categories && 0 < this.props.categories.length){
            cards = this.props.categories.map((item, index)=>{
                return (<TouchableOpacity key={index} onPress={()=>this.props.navigation.navigate("List", {category: item.name})}>
                    <ImageCard title={item.name} source={item.thumb?{uri: item.thumb}: null}/>
                </TouchableOpacity>)
            })
        } else {
            cards = [(<TouchableOpacity key={0} onPress={()=>this.props.navigation.navigate("List", {category: null})}>
                <ImageCard title="Collection" />
            </TouchableOpacity>)]
        }

        return (
            <Container style={{flex: 1}}>
                <ImageBackground source={require("../../assets/01_Background_PageAccueil.png")} style={{width:"100%", height: "100%"}}>
                    <Content contentContainerStyle={styles.content}>
                        <TouchableOpacity style={styles.adult} onPress={()=>this.props.navigation.navigate("List", {category: "adultes"})} >
                            <ImageBackground source={require("../../assets/01_Adulte_PageAccueil.png")} style={styles.button}>
                                <Text style={styles.buttonText}>JE SUIS UN ADULTE</Text>
                            </ImageBackground>
                            
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.child} onPress={()=>this.props.navigation.navigate("List", {category: "enfants"})}>
                            <ImageBackground source={require("../../assets/01_Enfant_PageAccueil.png")} style={styles.button}>
                                <Text style={styles.buttonText}>JE SUIS UN ENFANT</Text>
                            </ImageBackground>
                            
                        </TouchableOpacity>
                    </Content> 
                </ImageBackground>
            </Container>
        )
    }

    constructor(props) {
        super(props);

    }

    componentDidMount(){
        initialize()
        .then((data)=>{
            this.props.setData(data);
        })
        .catch(e=>{
            console.warn("Failed to initialize data : ", e.message);
            Toast.show({
                text: "(info) Données locales absentes",
                duration: 2000,
            })
            return;
        })
        .then(()=>{
            if(this.props.userName){ 
                return signIn(this.props.userName, this.props.password);
            } else {
                return Promise.reject(new Error ("can't sign in : no credentials"));
            }
        })
        .then (()=>watchFiles({
            projectName: this.props.projectName, 
            onProgress: (...messages) => {
                console.warn("watchFiles Progress : ", messages);
                Toast.show({
                    text: messages.join(" "),
                    duration: 2000,
                })
            }, 
            dispatch: this.props.setData.bind(this),
        }))
        .catch((e)=>{
            console.warn("no internet access : ", e.message);
            Toast.show({
                text: "(info) Pas d'accès internet",
                textStyle: {color: 'white'},
                duration: 2000,
            })
        })
        .then((unwatch)=>{
            const willFocusSubscribe = this.props.navigation.addListener("willFocus", ()=>{
                this.onFocus();
            });
            const willBlurSubscribe = this.props.navigation.addListener("willBlur", ()=>{
                if(this.abortController) this.abortController.abort();
            });
    
            this.unsubscribe = () => {
                willFocusSubscribe.remove();
                willBlurSubscribe.remove();
                if (typeof unwatch == 'function') unwatch();
            }
        })
    }

    componentWillUnmount(){
        if(this.unsubscribe) this.unsubscribe();
    }

    onFocus(){
        if(this.abortController) this.abortController.abort();
        this.abortController = new AbortController();        
        if(this.props.config && this.props.config.video && this.props.target){
            fetch(`http://${this.props.target.url}/control/current/${filename(this.props.config.video)}`, {method: 'PUT', signal: this.abortController.signal})
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
}

const styles = StyleSheet.create({
    content:{
    },
    button:{
        resizeMode: "contain",
        height: 160/2,
        width: 907/2,
        paddingLeft: 110,
    },
    adult: {
        position: "absolute",
        top: 175,
        left: 60,
    },
    child: {
        position: "absolute",
        top: 350,
        left: 180,
    },
    buttonText:{
        lineHeight: 160/2,
        fontSize: 36,
        color: "white",
        fontFamily: "Oswald",
    }
});

function mapStateToProps(state){
    const {data} = state;
    const {config, projectName, userName, password} = data;
    const categories = config.categories || [];
    return {
        categories, 
        projectName,
        userName,
        password,
        config, 
        target: getActiveProduct(state),
    };
}
export default connect(mapStateToProps, {setData})(HomeScreen);