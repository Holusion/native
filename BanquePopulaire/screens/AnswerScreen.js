import React from 'react';
import { Image, StyleSheet, Text, View, ImageBackground } from 'react-native';
import { Container, Content } from 'native-base';
import { NavigationEvents } from 'react-navigation';

export default class QuestionScreen extends React.Component {
    
    render() {
        return (
            <Container>
            <ImageBackground source={require('../assets/images/background.png')} style={{width: "100%", height: '100%'}}>
                <Content>
                        <Image style={styles.image} source={require("../assets/images/LogoRDR-BPGO.png")}/>
                        <View>
                            <Text style={styles.catchphrase}>Je me demandais...</Text>
                            <Text style={styles.question}>{this.props.navigation.getParam('question')}</Text>
                        </View>              
                </Content>
            </ImageBackground>
            </Container>
        )
    }

    constructor(props, context) {
        super(props, context);
        let back;
        this.props.navigation.addListener('willFocus', payload => {
            back = setTimeout(this.props.navigation.goBack, this.props.navigation.getParam('time') * 1000)
        })

        this.props.navigation.addListener('willBlur', payload => {
            if(back) {
                clearTimeout(back)
            }
            back = null;
        });
    }
}

const styles = StyleSheet.create({
    image: {
        flex: 1,
        width: 200,
        height: 100,
        resizeMode: 'contain',
        alignSelf: 'flex-end',
    },

    catchphrase: {
        color: "#1592ccff",
        fontSize: 100,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        marginTop: 300
    },

    question: {
        color: 'white',
        fontSize: 32,
        textAlign: 'center'
    }
})