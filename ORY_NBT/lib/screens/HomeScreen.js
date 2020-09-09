import React from 'react';

import { connect } from 'react-redux';

import { Container, Toast, Content, Footer, Spinner, Text, H1, H2, View, Button } from 'native-base';
import { StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';


import { filename } from "@holusion/cache-control";

import { setData } from '@holusion/react-native-holusion/lib/actions';
import { getActiveProduct, getItemsArray } from "@holusion/react-native-holusion/lib/selectors";
import {ImageCard, ObjectView} from '@holusion/react-native-holusion/lib/components';
import * as strings from "@holusion/react-native-holusion/lib/strings.json";
import Right from '@holusion/react-native-holusion/native-base-theme/components/Right';
import { Layout } from '../Layout';


class HomeScreen extends React.Component {
  render() {
    //First handle cases where application is not ready
    if (!this.props.projectName) {
      return (<Container>
        <Content contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Application non configurée</Text>
          <Text style={{ fontSize: 14 }}>Renseigner un nom dans l'écran de configuration</Text>
        </Content>
      </Container>)
    } else if (!this.props.config) {
      return (<Container>
        <Content contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
          <Text>Loading...</Text>
        </Content>
      </Container>)
    }

    if(this.props.config.defaultPage){
      const pageData = this.props.items.find(i => i.id == this.props.config.defaultPage)
      if(!pageData){
        return (<Container>
          <Content contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Page <Text style={{color:"orange"}}>{this.props.config.defaultPage}</Text>manquante</Text>
            <Text style={{ fontSize: 14 }}>Changer la page d'accueil ou créer une page correspondante</Text>
          </Content>
        </Container>)
      }
      return (<Container>
        <ObjectView active={true} navigation={this.props.navigation} {...pageData} />
      </Container>)
    }
    let links = this.props.categories?this.props.categories.map(({name})=>({name, to: name})): []
    return (<Layout
      image={this.props.config.image}
      links={links}
      navigate={(to)=>this.props.navigation.navigate("List",  { category: to })}
      enableAbout={this.props.config.about} 
    />);
  }

  constructor(props) {
    super(props);
  }

  onFocus() {
    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();
    if (this.props.config && this.props.config.video && this.props.target) {
      fetch(`http://${this.props.target.url}/control/current/${filename(this.props.config.video)}`, { method: 'PUT', signal: this.abortController.signal })
        .then(r => {
          if (!r.ok) {
            Toast.show({
              text: "Failed to set current : " + r.status,
              duration: 2000
            })
          }
        })
    }
  }
}

const styles = StyleSheet.create({
  container: {
  },
  titleContainer: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 150,
    paddingVertical: 70,
  },
  cardContainer: {
    flex: 0,
    //zIndex: 2,
    display: 'flex',
    flexDirection: "column",
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  imageContainer: {
    flex: 1,
    zIndex: 2,
  },
  backgroundContainer: {
    position: "absolute", 
    top: 0, 
    left: 0, 
    right: 0,
    bottom:0, 
    backgroundColor:"transparent", 
    display: "flex",
  },
  menuItem: {
    backgroundColor:"#9B8FC9FF",
    marginBottom:9,
    display: "flex",
    justifyContent:"flex-end"
  },
  menuText: {
    padding: 18,
    paddingLeft: 20,
    fontSize: 22,
    lineHeight: 22,
    textAlign: "left",
    color: "#443E7DFF",
  },
  footerStyle: {
    flex:1, 
    zIndex: 10,
    display: "flex", 
    flexDirection: "row", 
    justifyContent: "flex-end",
    alignItems:"flex-start",
    paddingBottom: 0,
    maxHeight:"100%",
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