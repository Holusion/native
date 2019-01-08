/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';

import { network, Playlist } from '@holusion/react-native-holusion'
import { Container, StyleProvider, Content, Header, Left, Right, Button } from 'native-base';

import nodejs from 'nodejs-mobile-react-native';

export default class App extends Component {
  
  state = {
    products: [],
    data: []
  }

  constructor(props, context) {
    super(props, context)
  }
  
  componentDidMount() {
    network.connect(async (service) => {
      let products = this.state.products.slice();
      products.push(service);
      let playlist = await network.getPlaylist(service.addresses[0]);
      let data = playlist.map(elem => elem.name);

      await this.promisedSetState({
        products: products,
        data: data
      })
    }, (name) => {
      
    })
    
  }

  componentWillMount() {
    nodejs.start('main.js');
    nodejs.channel.addListener('message', (msg) => {
      alert('From node: ' + msg);
    }, this);
  }

  promisedSetState = (newState) => {
    return new Promise((resolve) => {
      this.setState(newState, () => {
        resolve();
      })
    })
  }
  
  render() {

    return (
      <Container>
        <Header>
          <Left></Left>
          <Right></Right>
        </Header>
        <Content>
          <Button onPress={() => nodejs.channel.send('A message !')}>
            <Text>Message node</Text>
          </Button>
          <StyleProvider style={customTheme}>
            <Playlist url={network.getUrl()} content={this.state.data} />
          </StyleProvider>
        </Content>
      </Container>
    );
  }
}

const customTheme = {}
