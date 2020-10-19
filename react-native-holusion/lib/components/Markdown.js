import React from "react";
import {StyleSheet} from 'react-native';
import {connectStyle} from "native-base";
import Renderer from 'react-native-markdown-display'

class Markdown extends React.Component {
    render(){
        const styles = Array.isArray(this.props.style)? this.props.style.reduce((acc, v)=>{return {...acc, ...v}}, {}): this.props.style;
        return <Renderer style={styles}>{this.props.children}</Renderer>
    }
}

const mdTheme = StyleSheet.create({

});



export default connectStyle('Holusion.Markdown', mdTheme)(Markdown);
