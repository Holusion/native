import React from 'react'

import { Text, StyleSheet } from 'react-native'
import { Container } from 'native-base'
import { desactivateAll } from '../utils/Network'

export default class EndScreen extends React.Component {

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
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        color: '#005797ff',
        fontSize: 48,
        textAlign: 'center'
    }
})