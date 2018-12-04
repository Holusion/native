import React from 'react'

import { Text, StyleSheet } from 'react-native'
import { Container, Icon } from 'native-base'
import { zeroconfManager } from '@holusion/react-native-holusion';

export default class EndScreen extends React.Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerRight: <Icon style={{marginRight: 16, color: navigation.getParam('color', 'red')}} name="ios-wifi"/>
        }
    }

    render() {
        return (
        <Container style={styles.container}>
            <Text style={styles.text}>Merci de votre visite, à bientôt</Text>
        </Container>
        )
    }

    constructor(props, context) {
        super(props, context);

        this.props.navigation.addListener('willFocus', payload => {
            setTimeout(() => this.props.navigation.push("Home"), 5000);
        })

        if(zeroconfManager.getUrl()) {
            this.props.navigation.setParams({'color': 'green'})
        }
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        color: '#ae2573ff',
        fontSize: 48,
        textAlign: 'center'
    }
})