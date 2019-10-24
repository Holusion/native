import React from 'react';

import {setData} from '../actions';
import { connect} from 'react-redux';

import { Container, Toast, Content, Footer, Spinner, Text, H1, View} from 'native-base';
import { StyleSheet, TouchableOpacity} from 'react-native';

import Markdown from '../components/Markdown'

import {initialize} from "../files";



class AboutScreen extends React.Component {
    render() {
        return(<Container>
            <Content>
            <Container>
                <Content>
                    <Markdown style={{text: {
                        fontSize: 24,
                        textAlign: "justify"
                    }}}>
                        {this.props.config.about}
                    </Markdown>
                </Content>
            </Container>
            </Content>
        </Container>)
    }

    constructor(props) {
        super(props);
    }
}


function mapStateToProps(state){
    const {data} = state;
    return {config: data.config};
}

export default connect(mapStateToProps)(AboutScreen);
