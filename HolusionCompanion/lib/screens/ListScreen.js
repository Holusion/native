import React from 'react';
import { connect} from 'react-redux';

import {getActiveProduct} from "@holusion/cache-control";


import ListObjects from "../containers/ListObjects";
import { useAutoPlay } from '../sync/hooks';
import { ScrollView } from 'react-native';


function ListScreen (props) {
  useAutoPlay();
  const {category} = props.route.params?props.route.params :{};
  let video = props.config? props.config.video : undefined;
  if(props.config && category){
    let catData = props.config.categories.find(c=> c.name =="category");
    if(catData && catData.video){
        video = catData.video;
    }
  }
  
  return (<ScrollView style={{flex: 1}}>
    <ListObjects
      selectedCategory={category}
      onNavigate={(id) => props.navigation.navigate("Object", {params: {id}, screen: category})}
    />
  </ScrollView>)
}

export default connect(function(state){
    const {data} = state;
    return {
        config: data.config,
        target: getActiveProduct(state)
    }
})(ListScreen);


