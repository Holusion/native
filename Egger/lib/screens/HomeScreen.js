import React from 'react';

import { connect } from 'react-redux';

import { Container,  Content, Footer, Spinner, Text, H1, H2, View, Button } from 'native-base';
import { StyleSheet, TouchableOpacity, ImageBackground} from 'react-native';

import { selectors, useAutoPlay } from "@holusion/react-native-holusion";

const { getItemsArray } = selectors;

function HomeScreen (props) {
  useAutoPlay();

  //First handle cases where application is not ready
  if (!props.projectName) {
    return (<Container>
      <Content contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Application non configurée</Text>
        <Text style={{ fontSize: 14 }}>Renseigner un nom dans l'écran de configuration</Text>
      </Content>
    </Container>)
  } else if ((!props.config || !props.items || props.items.length== 0)) {
    return (<Container>
      <Content contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
        <Text>Loading...</Text>
      </Content>
    </Container>)
  }


  return (
    <TouchableOpacity style={{width: '100%', height: '100%'}} onPress={()=>props.navigation.navigate("Object", {id:"general"})}>
        <ImageBackground source={require('../../assets/Ecran_titre.png')} style={{width: '100%', height: '100%'}} >
    </ImageBackground>
    </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
  container: {
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
    textAlign: 'center',
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

function mapStateToProps(state) {
  const { data, conf } = state;
  const { config } = data;
  const categories = config.categories || [];
  return {
    categories,
    items: getItemsArray(state),
    projectName: conf.projectName,
    config,
  };
}

export default connect(mapStateToProps, {})(HomeScreen);
