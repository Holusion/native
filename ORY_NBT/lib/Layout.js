import React from 'react';
import PropTypes from "prop-types";
import { connect } from 'react-redux';

import { Container, Toast, Content, Footer, Spinner, Text, H1, H2, View, Button } from 'native-base';
import { StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';





export function Layout({
  title="ORY NBT",
  subtitle,
  image,
  links,
  navigate,
  enableAbout = false,
  background=require("../assets/background.png"),
  children,
}){
  let cards = links.map((category, index) => {
    let name = (typeof category === "string")? category : category.name;
    let itemStyle = [
      styles.menuItem,
      {width: 182 + index*3.7 + 0.8*Math.pow(index, 2)}
    ];
    if(category.active){
      itemStyle.push(styles.activeMenuItem);
    }
    return (<TouchableOpacity key={index} onPress={() => {
      if(category.to) navigate(category.to);
    }}>
      <H2 style={itemStyle}>
        {name}
      </H2>
    </TouchableOpacity>)
  })

  return (
    <View style={styles.container}>
      <View style={{flex: 0, flexDirection:"row"}}>
        <ImageBackground source={require("../assets/titlebar.png")} style={{width:"100%"}}>
          <View style={styles.titleContainer}>
            <H1 primary style={{paddingVertical:12, fontSize: 45}} >
              {title}
            </H1>
            {subtitle && <H2 secondary style={{fontSize: 26}}>
              {subtitle}
            </H2>}
          </View>
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
              <H2 primary style={styles.footerButton}>à propos</H2>
            </Button>}
          </View>
          <View style={styles.footerStyle}>
            <Image style={{ width:128, marginTop: -40, height: 120}} resizeMode="contain" source={require("../assets/MIN_Transition_Ecologique_CMJN.jpg")}/>
            <Image style={{width:90, height:90}} resizeMode="contain" source={require("../assets/Logo_DSNA.png")}/>    
            <Image style={{width:90, height: 90}} resizeMode="contain" source={require("../assets/Logo_SNIA.png")}/>        
          </View>
        </ImageBackground>
      </Footer>
    </View>
  )
}
Layout.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  image: PropTypes.string,
  links: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string, 
    PropTypes.shape({
      name:PropTypes.string.isRequired,
      to: PropTypes.string,
      active: PropTypes.bool,
    })
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
    height:"100%",
    backgroundColor: "white",
  },
  titleContainer: {
    flex: 0,
    paddingLeft: 150,
    height: 160,
    flexDirection: "column",
    justifyContent: "center"
  },
  cardContainer: {
    flex: 0,
    //zIndex: 10, //Enable to view links extents
    display: 'flex',
    flexDirection: "column",
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    backgroundColor: "transparent"
  },
  imageContainer: {
    flex: 1,
    zIndex: 2,
  },
  children: {
    flex: 0,
    width: 360,
    height: "100%",
    padding: 0,
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
    color: "#443E7DFF",
    marginBottom:9,
    fontSize: 22,
    lineHeight: 22,
    paddingTop: 18,
    paddingBottom: 18,
    paddingLeft: 20,
    paddingRight: 4,
    textAlign: "left",
  },
  activeMenuItem: {
    backgroundColor: "#9B8FC9FF",
    color:"white",
  },
  footerStyle: {
    flex:0, 
    zIndex: 10,
    width: 320,
    display: "flex", 
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems:"flex-end",
    paddingBottom: 0,
    marginTop: -50,
  },
  footerButton: {
    fontSize: 28
  }
});
