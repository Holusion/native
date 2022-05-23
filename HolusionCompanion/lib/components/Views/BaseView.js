import React, { useContext } from 'react'


import { ImageBackground, ScrollView, View, StyleSheet } from 'react-native';

import { H1, H2, ThemeContext } from "../style";

import Markdown from '../Markdown';
import {LinksView} from './partials';


function useThemedBaseView(){
  const theme = useContext(ThemeContext);
  return {contentView: {
    position: theme.baseDescription.backgroundColor === "transparent" ? "absolute" : "relative",
    backgroundColor: theme.baseDescription.backgroundColor,
    width: theme.baseDescription.width,
    height: theme.baseDescription.height,
    top: theme.baseDescription.top,
    right: theme.baseDescription.right,
  },
  image:{
  }};
}


export default function BaseView(props){
  const themeStyle = useThemedBaseView();
  const d = props;
  const source = ((d && d.image)?{uri: d.image}: require("../../../assets/missing-image.png"));
  const withDescription = typeof d['description']=== "string" && d['description'].length ? true:false;

  return(<View style={{flex:1,display:"flex", flexDirection:"row", justifyContent:"space-evenly"}}>

      {(d && d.image) && <View testID="image-content" style={baseStyles.image}>
          <ImageBackground resizeMode= 'contain' source={source} style={{flex:1}} >
              <H1 color="primary" style={baseStyles.title}>{d["title"]}</H1>
              <H2 color="secondary" style={baseStyles.subtitle}>{d["subtitle"]}</H2>
          </ImageBackground>
      </View>}
      {withDescription && 
        <View testID="description-content" style={[baseStyles.contentView, themeStyle.contentView ]}>
          <ScrollView contentContainerStyle={{}}>
            <Markdown style={baseStyles.markdown}>{d['description']}</Markdown>
          </ScrollView>
        </View>
      }
      <LinksView style={baseStyles.link} items={d["links"] || []}/>
  </View>)
}

const baseStyles = StyleSheet.create({
  image:{      
    flex:1,
    backgroundColor:"#fff"
  },
  contentView:{
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
    position:'absolute',
    zIndex: 2
  }
});