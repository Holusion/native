import React from 'react';

import {setData} from '../actions';
import { connect} from 'react-redux';

import { Container, Toast, Content, Spinner, Text} from 'native-base';
import { StyleSheet, View, TouchableOpacity} from 'react-native';

import * as Config from '../../Config'

import {loadFile} from "../utils/loadFile";

import { IconCardComponent } from '@holusion/react-native-holusion'

import resources from '../../resources'
import * as strings from '../../strings'


class HomeScreen extends React.Component {
    render() {
        if(this.state.status == "loading"){
            return(<Container><Content contentContainerStyle={{flex: 1, alignItems: 'center', justifyContent: 'center',}}>
               <Spinner/> 
                <Text>Loading...</Text>
            </Content></Container>)
        }
        return (
            <Container style={{flex: 1}}>
                <View style={styles.container}>
                    <View style={styles.titleContainer}>
                        <Text >
                        </Text>
                    </View>
                    <View style= {styles.cardContainer}>
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate("Object", {id:"pied_de_croix"})}>
                            <IconCardComponent source={resources.rightCardIcon} title={strings.home.rightCardTitle} customStyleProp={{container: {backgroundColor: Config.remoteConfig.primaryColor}}} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate("Remerciements")} style={[styles.footerContainer, {backgroundColor: Config.remoteConfig.primaryColor}]}>
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
        this.state= {status: "loading", config: {}};

    }
    componentDidMount(){
        this.load();
    }
    load(){
        this.setState({status: "loading"});
        loadFile("data.json")
        .then((data)=>{
            this.props.setData(JSON.parse(data));
            this.setState({status:"done"});
            console.warn(JSON.parse(data));
        })
        .catch((err)=>{
            this.props.navigation.navigate("Update",{error: "Application configuration is required"});
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
        flexDirection: "column", 
        alignItems: 'center'
    },
    images: {
        width: 200,
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
    const cards = Object.keys(data).map((key)=>{
        return {id: key, title: data[key]["title"], thumb: data[key]["thumb"]}
    })
    return {target, cards};
}
export default connect(mapStateToProps, {setData})(HomeScreen);