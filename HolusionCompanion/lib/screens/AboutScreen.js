import React from 'react';

import { connect} from 'react-redux';

import { ScrollView } from 'react-native';
import { Container, Content} from 'native-base';

import Markdown from '../components/Markdown'




class AboutScreen extends React.Component {
    render() {
        return(<ScrollView >
            <Markdown style={{text: {
                fontSize: 24,
                textAlign: "justify"
            }}}>
                {this.props.config.about}
            </Markdown>
        </ScrollView >)
    }

    constructor(props) {
        super(props);
    }
}


function mapStateToProps(state){
    const {data} = state;
    return {config: data.config};
}

export default connect(mapStateToProps)(AboutScreen);
