import React from 'react';

import { setData } from '../actions';
import { connect } from 'react-redux';

import { Container, Toast, Content, Footer, Spinner, Text, H1, H2, View, Button } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { getActiveProduct, getItemsArray } from "../selectors";

import { filename } from "@holusion/cache-control";

import ImageCard from '../components/ImageCard';

import * as strings from "../strings.json";

import ObjectView from "../components/ObjectView";
import ListObjects from '../containers/ListObjects';
import { useAutoPlay } from '../sync/hooks';

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
  console.log("Configuration : ", props.config);
  
  if(props.config.defaultPage){
    const pageData = props.items.find(i => i.id == props.config.defaultPage)
    if(!pageData){
      return (<Container>
        <Content contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Page <Text style={{color:"orange"}}>{props.config.defaultPage}</Text> manquante</Text>
          <Text style={{ fontSize: 14 }}>Changer la page d'accueil ou créer une page correspondante</Text>
        </Content>
      </Container>)
    }
    return (<Container>
      <ObjectView active={true} navigation={props.navigation} {...pageData} />
    </Container>)
  }
  if(!props.categories || props.categories.length == 0){
    return <Container>
      <ListObjects onNavigate={(id)=>props.navigation.navigate("Object", {id, category: null})}/>
    </Container>
  }

  let cards = props.categories.map((category, index) => {
    const category_items = props.items.filter(i => {
      if (i.theme) return category.name == i.theme;
      if (i.category) return category.name == i.category;
    });
    if (category_items.length == 0) {
      return (<TouchableOpacity disabled={true} key={index} >
        <ImageCard title={category.name} source={category.thumb ? { uri: category.thumb } : null} />
      </TouchableOpacity>)
    } else if (category_items.length == 1) {
      return (<TouchableOpacity key={index} onPress={() => props.navigation.navigate("Object", { id: category_items[0].id, category: category.name })}>
        <ImageCard title={category.name} source={category.thumb ? { uri: category.thumb } : null} />
      </TouchableOpacity>)
    }
    return (<TouchableOpacity key={index} onPress={() => props.navigation.navigate("List", { category: category.name })}>
      <ImageCard title={category.name} source={category.thumb ? { uri: category.thumb } : null} />
    </TouchableOpacity>)
  })


  let footer;
  if (props.config.about) {
    footer = (<Footer >
      <Button transparent onPress={() => props.navigation.navigate("About")}>
        <H2 primary style={styles.footerButton}>{strings.home.footerButton}</H2>
      </Button>

    </Footer>)
  }
  return (
    <Container>
      <VideoPlayer video={props.config?props.config.video:undefined}/>
      <Content contentContainerStyle={styles.container}>
        <H1 primary style={styles.titleContainer}>
          Découvrez une collection :
                  </H1>
        <View style={styles.cardContainer}>
          {cards}
        </View>
      </Content>
      {footer}
    </Container>
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
    target: getActiveProduct(state),
  };
}

export default connect(mapStateToProps, { setData })(HomeScreen);