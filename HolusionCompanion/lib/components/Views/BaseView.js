import React from 'react'


import { connectStyle, Container, Content, H1, H2, View } from 'native-base';
import { ImageBackground } from 'react-native';

import Markdown from '../Markdown';
import {LinksView} from './partials';

class BaseView extends React.Component{
  render(){
    const {style, ...d} = this.props;
    const source = ((d && d.image)?{uri: d.image}: require("../../../assets/missing-image.png"));
    const withDescription = typeof d['description']=== "string" && d['description'].length ? true:false;
    return(<Container style={{flex:1, display:"flex", flexDirection:"row", justifyContent:"space-evenly"}}>
        <View testID="image-content" style={style.image}>
            <ImageBackground resizeMode= 'contain' source={source} style={{width: '100%', height: '100%'}} >
                <H1 primary style={style.title}>{d["title"]}</H1>
                <H2 secondary style={style.subtitle}>{d["subtitle"]}</H2>
                <LinksView style={style.link} items={d["links"] || []}/>
            </ImageBackground>
        </View>
        {withDescription && 
            <View testID="description-content" style={style.contentView}>
              <Content contentContainerStyle={{}}>
                <Markdown style={style.markdown}>{d['description']}</Markdown>
              </Content> 
            </View>
          }
    </Container>)
  }
}

const baseStyles = {
    image:{      
      flex: 1,
    },
    contentView:{
        position:"absolute",
        right:"0%",
        top:"0%",
        zIndex: 1,
        padding: 10,
        paddingBottom: 40,
        backgroundColor: "#f1f1f1",
        height:"100%",
        width:"100%",
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
};

const BaseViewClass =  connectStyle('Holusion.BaseView', baseStyles)(BaseView);
export default function BaseView_(props){
  return <BaseViewClass {...props}/>
}