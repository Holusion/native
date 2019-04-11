import React from 'react'
import { ScrollView, TouchableOpacity } from 'react-native';
import { Grid, Col, Row, StyleProvider, connectStyle } from 'native-base';

import IconCardComponent from './IconCardComponent';

export class PlaylistComponent extends React.Component {
    renderContent() {
        let rows = [];
        let items = [];

        let contents = this.props.playlist.contents;

        for(let i = 0; i < contents.length; i++) {
            let current = contents[i];
            items.push(
                <TouchableOpacity key={i} onPress={() => this.props.actionItem(i)}>
                    <IconCardComponent source={{uri: current.image, scale: 1}} title={current.name}/>
                </TouchableOpacity>
            )
            if(items.length % 3 == 0) {
                rows.push(
                    <Row key={i}>
                        {items}
                    </Row>
                )
                items = []
            }
        }

        if(items.length > 0) {
            rows.push(
                <Row key={contents.length + 1}>
                    {items}
                </Row>
            )
        }

        return rows;
    }

    render() {
        const styles = this.props.style;

        return (
            <ScrollView>
                <Grid>
                    <StyleProvider style={customTheme}>
                        <Col style={styles.col}>
                            {this.renderContent()}
                        </Col>
                    </StyleProvider>
                </Grid>
            </ScrollView>
        )
    }
}

const styles = {
    col: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }
}

const customTheme = {
    'holusion.IconCardComponent': {
        container: {
            width: 250,
            height: 250
        },
        icon: {
            width: 250 * 0.6,
            height: 250 * 0.6
        }
    },
}

export default connectStyle('holusion.PlaylistComponent', styles)(PlaylistComponent)