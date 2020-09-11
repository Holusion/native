import React from 'react';
import PropTypes from 'prop-types';
import {setData} from '../actions';
import {getActiveItems} from "../selectors";
import { connect} from 'react-redux';

import { Container, Toast} from 'native-base';

import {getActiveProduct} from "../selectors";

import { filename} from "@holusion/cache-control";

import ListObjects from "../containers/ListObjects";

class ListScreen extends React.Component {
    render() {
        const {category} = this.props.route.params?this.props.route.params :{};
        return (
            <Container style={{flex: 1}}>
                <ListObjects 
                selectedCategory={category}
                onNavigate={(id) => this.props.navigation.navigate("Object", {id, category})}
                />
            </Container>
        )
    }
    onFocus(){
        if(this.props.config&& this.props.config.video && this.props.target){
            //console.warn("ListScreen focus to ",filename(this.props.config.video));
            fetch(`http://${this.props.target.url}/control/current/${filename(this.props.config.video)}`, {method: 'PUT'})
            .then(r=>{
                if(!r.ok){
                    console.warn("Failed to set current : "+r.status)
                    Toast.show({
                        text: "Failed to set current : "+r.status,
                        duration: 2000
                    })
                }
            })
        }else{
            //console.warn("ListScreen skip focus : ", this.props.config, this.props.target);
        }
    }
    componentDidMount(){
        this.subscription = this.props.navigation.addListener("focus", ()=>{
            this.onFocus();
        })
    }
    componentWillunmount(){
        this.subscription.remove();
    }
    constructor(props) {
        super(props);
    }
}

export default connect(function(state, props){
    const {data} = state;
    return {
        config: data.config,
        target: getActiveProduct(state)
    }
})(ListScreen);


