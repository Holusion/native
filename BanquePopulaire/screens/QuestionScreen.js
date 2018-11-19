import React from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Container, Content } from 'native-base';

import ListItem from '../components/ListItem';

export default class QuestionScreen extends React.Component {
    render() {
        let actualQuestions = questions[this.props.navigation.getParam('genre')];
        let questionsView = [];

        for(let i = 0; i < actualQuestions.length; i++) {
            let isBlue = (i % 2 == 1);
            let backgroundColor = isBlue ? '#1592ccff' : null;
            let color = isBlue ? "white" : "#043263ff";

            questionsView.push(
                <ListItem key={i} style={[{backgroundColor: backgroundColor}, styles.listItem]} onPress={() => this._onAnswer(actualQuestions[i])}>
                    <Image source={actualQuestions[i].image} style={{width: 100, height: 100}}/>
                    <View>
                        <Text style={[{color: color}, styles.questionText]}>Question {i + 1} :</Text>
                        <Text style={[{color: color}, styles.questionText]}>{actualQuestions[i].phrase}</Text>
                    </View>
                </ListItem>
            )
        }

        return (
            <Container>
            <Content>
                <View style={{flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                    <Text style={styles.catchphrase}>Sélectionnez une question</Text>
                    <Image style={styles.image} source={require("../assets/images/LogoRDR-BPGO.png")}/>           
                </View>
                <View style={{borderWidth: 1, borderColor: '#ccccccff', marginLeft: 24, marginRight: 24}}/>
                <View>
                    {questionsView}
                </View>
            </Content>
            </Container>
        )
    }

    constructor(props, context) {
        super(props, context);
        this._onAnswer = this._onAnswer.bind(this);
    }

    _onAnswer(video) {
        fetch(`http://${this.props.navigation.getParam('url')}:3000/control/current/${video.video}`, {
            method: 'PUT'
        });
        this.props.navigation.push('Answer', {question: video.phrase, time: video.time, url: this.props.navigation.getParam('url')})
    }
}

const styles = StyleSheet.create({
    image: {
        flex: 1,
        width: 200,
        height: 100,
        resizeMode: 'contain',
    },

    catchphrase: {
        flex: 4,
        color: "#1592ccff",
        fontSize: 32,
        margin: 24,
        textAlign: 'left'
    },

    questionText: {
        fontSize: 26,
        paddingLeft: 16,
    },

    listItem: {
        height: 128,
        padding: 16
    }
})

const images = {
    sommeil: require('../assets/icons/sommeil.png'),
    peur : require('../assets/icons/peur.png'),
    bonheur: require('../assets/icons/bonheur.png'),
    phone: require('../assets/icons/phone.png'),
    position: require('../assets/icons/position.png'),
    equipe: require('../assets/icons/equipe.png'),
    route: require('../assets/icons/route.png'),
    sante: require('../assets/icons/sante.png'),
    repas: require('../assets/icons/repas.png'),
    wc: require('../assets/icons/wc.png')
}

const questions = {
    adulte: [
        {image: images.sommeil, phrase: 'Comment gérez-vous le sommeil pendant la couse ?', video: 'Question1.mp4', time: 32},
        {image: images.peur, phrase: 'Avez-vous parfois peur sur le bateau ?', video: 'Question2.mp4', time: 24},
        {image: images.bonheur, phrase: 'Avez-vous un porte-bonheur sur le bateau', video: 'Question3.mp4', time: 19},
        {image: images.phone, phrase: 'Comment faites-vous pour communiquer avec votre famille ?', video: 'Question4.mp4', time: 26},
        {image: images.position, phrase: 'Regardez vous souvent la position des concurrents pendant la course ?', video: 'Question5.mp4', time: 31},
        {image: images.equipe, phrase: 'Avez-vous le droit d’avoir des conseils de votre équipe sur terre ?', video: 'Question6.mp4', time: 44},
        {image: images.route, phrase: 'Etes-vous aidé sur le routage pendant la course ?', video: 'Question7.mp4', time: 34},
        {image: images.sante, phrase: 'En cas de problème de santé, quelles solutions avez-vous à votre disposition ?', video: 'Question8.mp4', time: 43},
        {image: images.repas, phrase: 'Comment vous alimentez-vous pendant la course ?', video: 'Question9.mp4', time: 48}
    ],
    enfant: [
        {image: images.sommeil, phrase: 'Comment fais-tu pour dormir sur le bateau ?', video: 'Question1.mp4', time: 32},
        {image: images.peur, phrase: 'As-tu peur sur le bateau ?', video: 'Question2.mp4', time: 24},
        {image: images.bonheur, phrase: 'As-tu un porte-bonheur pour faire la course ?', video: 'Question3.mp4', time: 19},
        {image: images.phone, phrase: 'Comment fais-tu pour communiquer avec ta famille ?', video: 'Question4.mp4', time: 26},
        {image: images.equipe, phrase: 'Est-ce que ton équipe à terre peut te donner des conseils pendant la course ?', video: 'Question6.mp4', time: 44},
        {image: images.sante, phrase: 'En cas de blessure, comment fais-tu ?', video: 'Question8.mp4', time: 43},
        {image: images.repas, phrase: 'Qu’est-ce que tu manges pendant la course ?', video: 'Question9.mp4', time: 48},
        {image: images.wc, phrase: 'Comment fait-on pour faire pipi et caca sur le bateau ?', video: 'Question10.mp4', time: 18}
    ]
}