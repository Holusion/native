import React from 'react';
import PropTypes from "prop-types";
import { connect } from 'react-redux';

import { Container, Toast, Content, Footer, Spinner, Text, H1, H2, View, Button } from 'native-base';
import { StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';



import * as strings from "@holusion/react-native-holusion/lib/strings.json";


export function Layout({
  title="ORY NBT",
  image,
  links,
  navigate,
  enableAbout = false,
  background=require("../assets/background.png"),
  children,
}){
  let cards = links.map((category, index) => {
    let name = (typeof category === "string")? category : category.name;
    return (<TouchableOpacity key={index} onPress={() => navigate(category.to)}>
      <View style={[styles.menuItem, {width: 180 + (index*6)}]}>
        <H2 style={styles.menuText}>{name}</H2>
      </View>
    </TouchableOpacity>)
  })

  return (
    <View style={{height:"100%"}}>
      <View style={{flex: 0, flexDirection:"row"}}>
        <ImageBackground source={require("../assets/titlebar.png")} style={{width:"100%"}}>
          <H1 primary style={styles.titleContainer}>
            {title}
          </H1>
        </ImageBackground>
      </View>
      <View style={{flex:1, flexDirection:"row-reverse"}}>
        <View style={styles.cardContainer}>
          {cards}
        </View>
        {children && <View style={styles.children}>{children}</View>}
        <View style={styles.imageContainer}>
          {image && <Image resizeMode="contain" style={{width:"100%", top: 0, height:"100%", zIndex:2, position:"absolute"}} source={{uri: image}}/>}
        </View>
        <View pointerEvents="none" style={styles.backgroundContainer}>
          <Image style={{flex:1, width: "100%"}} resizeMode="stretch" source={background}/>
        </View>
        {children && <View pointerEvents="none" style={styles.mask}>
          <Image style={{flex:1, width: "100%"}} resizeMode="stretch" source={require("../assets/background_mask.png")}/>
        </View>}
      </View>
      <Footer style={{flex: 0}}>
        <ImageBackground style={{width:"100%", display:"flex", flexDirection: "row", justifyContent:"space-between"}} source={require("../assets/footer.png")}>
          <View style={{flex:1}}>
            {enableAbout && <Button transparent onPress={() => navigate("About")}>
              <H2 primary style={styles.footerButton}>{strings.home.footerButton}</H2>
            </Button>}
          </View>
          <View style={styles.footerStyle}>
            <View style={{width:220, height: 100, overflow: "visible"}}>
              <Image style={{position: "absolute", bottom:0, width:100}} resizeMode="contain" source={require("../assets/logo_ministère.png")}/>
              <Image style={{position: "absolute", bottom:0, right: 0, width:90}} resizeMode="contain" source={require("../assets/logo_DGAC_SNIA.png")}/>        
            </View>
          </View>
        </ImageBackground>
      </Footer>
    </View>
  )
}
Layout.propTypes = {
  title: PropTypes.string,
  image: PropTypes.string,
  links: PropTypes.arrayOf(PropTypes.oneOf([
    PropTypes.string, 
    PropTypes.shape({name:PropTypes.string.isRequired})
  ])),
  navigate: PropTypes.func.isRequired,
  enableAbout: PropTypes.bool,
  //Optional props for parts
  background: PropTypes.shape({
    uri: PropTypes.string.isRequired
  }),
  children: PropTypes.node,
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
    //zIndex: 10, //Enable to view links extents
    display: 'flex',
    flexDirection: "column",
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  imageContainer: {
    flex: 1,
    zIndex: 2,
  },
  children: {
    flex: 0,
    width: 250,
    padding: 4,
    zIndex: 3,
  },
  mask: {
    position: "absolute", 
    top: 0, 
    left: 0, 
    right: 0,
    bottom:0, 
    backgroundColor:"transparent", 
    display: "flex",
    zIndex: 4
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
