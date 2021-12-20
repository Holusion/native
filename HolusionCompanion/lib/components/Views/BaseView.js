import React, { useContext } from 'react'
import { useHeaderHeight } from '@react-navigation/elements';


import { ImageBackground, ScrollView, View, StyleSheet } from 'react-native';

import { H1, H2, ThemeContext } from "../style";

import Markdown from '../Markdown';
import {LinksView} from './partials';


function useThemedBaseView(){
  const theme = useContext(ThemeContext);
  return {contentView: {
    position: theme.baseDescription.position,
    backgroundColor: theme.baseDescription.backgroundColor,
    width: theme.baseDescription.width,
    top: theme.baseDescription.top,
    right: theme.baseDescription.right,
  },
  image:{
  }};
}


export default function BaseView(props){
  const headerHeight = useHeaderHeight();
  const themeStyle = useThemedBaseView();
  const d = props;
  const source = ((d && d.image)?{uri: d.image}: require("../../../assets/missing-image.png"));
  const withDescription = typeof d['description']=== "string" && d['description'].length ? true:false;

  return(<View style={{flex:1,display:"flex", flexDirection:"row", justifyContent:"space-evenly", paddingBottom:headerHeight}}>
      <View testID="image-content" style={baseStyles.image}>
          <ImageBackground resizeMode= 'contain' source={source} style={{flex:1, backgroundColor:"red"}} >
              <H1 color="primary" style={baseStyles.title}>{d["title"]}</H1>
              <H2 color="secondary" style={baseStyles.subtitle}>{d["subtitle"]}</H2>
              <LinksView style={baseStyles.link} items={d["links"] || []}/>
          </ImageBackground>
      </View>
      {withDescription && 
        <View testID="description-content" style={[baseStyles.contentView, themeStyle.contentView ]}>
          <ScrollView contentContainerStyle={{}}>
            <Markdown style={baseStyles.markdown}>{d['description']}</Markdown>
          </ScrollView>
        </View>
      }
      <View style={{position:"absolute",top:0,left:0,width:10, height:10, borderWidth:1, borderColor:"blue"}}/>
      <View style={{position:"absolute",bottom:50,left:0,width:10, height:10, borderWidth:1, borderColor:"blue"}}/>
  </View>)
}

const baseStyles = StyleSheet.create({
    image:{      
      flex:1

    },
    contentView:{
        position:"relative",
        right:"0%",
        top:"0%",
        zIndex: 1,
        padding: 20,
        paddingBottom: 40,
        backgroundColor: "#f1f1f1",
    },
    title:{
        paddingTop: 30,
        paddingLeft: 10,
        width:"100%",
    },
    subtitle:{
        paddingLeft: 10,
    },
    link: {
      zIndex: 1
    }
});