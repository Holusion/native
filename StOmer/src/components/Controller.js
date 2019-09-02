'use strict';
import React from 'react';
import {View, Button, Icon} from "native-base";
import {TouchableHighlight, StyleSheet} from "react-native"
import {connect} from "react-redux";

import {delay} from "../utils/time";

class Controller extends React.Component {
    constructor(props){
        super(props);
        this.last_request = Promise.resolve();
    }
    render(){
        return (<Button large primary onPressIn={()=>this.pause()} onPressOut={()=>this.pause()} style={styles.button}>
            <Icon large type="Ionicons" name="pause" style={styles.icon} />
        </Button>)
    }
    pause(){
        this.last_request = this.last_request
        .then(()=> fetch(`http://${this.props.target.url}/control/pause`, {method:"POST"}))
        .then(()=>delay(70));
    }
}
function mapStateToProps(state){
    const {products} = state;
    const target = products.find(p => p.active == true);
    return {
        target
    }
}
const styles = StyleSheet.create({
    button:{
        padding:5, 
        borderRadius: 50
    },
    icon:{
        fontSize: 40,
    }
})
export default connect(mapStateToProps,{})( Controller);