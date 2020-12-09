import React from 'react';
import { connect} from 'react-redux';

import { Container } from 'native-base';

import {getActiveProduct} from "@holusion/cache-control";

import ListObjects from "../containers/ListObjects";
import { useAutoPlay } from '../sync/hooks';


function ListScreen (props) {
    const {category} = props.route.params?props.route.params :{};
    let video = props.config? props.config.video : undefined;;
    if(props.config && category){
        let catData = (props.config.categories|| []).find(c=> c.name =="category");
        if(catData && catData.video){
            video = catData.video;
        }
    }
    useAutoPlay();

    return (
        <Container style={{flex: 1}}>
            <ListObjects 
            selectedCategory={category}
            onNavigate={(id) => props.navigation.navigate("Object", {screen: id, category})}
            />
        </Container>
    )
}

export default connect(function(state){
    const {data} = state;
    return {
        config: data.config,
        target: getActiveProduct(state)
    }
})(ListScreen);


