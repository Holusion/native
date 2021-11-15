import React from 'react';

import { connect} from 'react-redux';

import { Container, Content} from 'native-base';

import Markdown from '../components/Markdown'




class AboutScreen extends React.Component {
    render() {
        return(<Container>
            <Content>
            <Container>
                <Content>
                    <Markdown style={{text: {
                        fontSize: 24,
                        textAlign: "justify"
                    }}}>
                        {this.props.config.about}
                    </Markdown>
                </Content>
            </Container>
            </Content>
        </Container>)
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
