import React from 'react';

import {setData} from '@holusion/react-native-holusion/lib/actions';
import { connect} from 'react-redux';

import { Container, Toast, Content, Spinner, Text, H1, H2, View, Button} from 'native-base';
import { StyleSheet, TouchableOpacity, ImageBackground} from 'react-native';

import {getActiveProduct} from "@holusion/react-native-holusion/lib/selectors";

import {watchFiles, filename, signIn, initialize} from "@holusion/react-native-holusion/lib/files";

class HomeScreen extends React.Component {
    render() {
        if(!this.props.items.length == 0){
            return(<Container><Content contentContainerStyle={{flex: 1, alignItems: 'center', justifyContent: 'center', background:'black'}}>
                <Spinner color="white"/> 
                <Text>Loading...</Text>
            </Content></Container>)
        }
        return (
            <TouchableOpacity style={{width: '100%', height: '100%'}} onPress={()=>this.props.navigation.navigate("GroupView", {id:"general"})}>
                <ImageBackground source={require('../../assets/Ecran_titre.png')} style={{width: '100%', height: '100%'}} >
            </ImageBackground>
            </TouchableOpacity>
            
        )
    }

    constructor(props) {
        super(props);

    }
    componentDidMount(){
        signIn("user@dev.holusion.net", "KsrVjGDm")
        .then (()=>{
            return watchFiles({projectName: this.props.projectName, onProgress: console.warn, dispatch: this.props.setData.bind(this)})
        }, (e)=>{
            console.warn("Failed to sign-in : using local data");
            return initialize().then((data)=>{
                this.props.setData(data);
            })
        })        
        .catch(e=>{
            console.error("Failed to initialize data : ", e);
            return function(){}
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
                unwatch();
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

function mapStateToProps(state){
    const {data} = state;
    const {config, items, projectName} = data;
    const categories = config.categories || [];
    return {
        categories, 
        projectName, 
        items,
        config, 
        target: getActiveProduct(state),
    };
}
export default connect(mapStateToProps, {setData})(HomeScreen);