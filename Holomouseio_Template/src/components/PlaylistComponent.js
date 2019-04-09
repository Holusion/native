import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Grid, Col, Row, StyleProvider, connectStyle } from 'native-base';

import IconCardComponent from './IconCardComponent';

export class PlaylistComponent extends Reac.Component {
    renderContent() {
        let rows = [];
        let items = [];

        let contents = this.props.playlist.contents;

        for(let i = 0; i < contents.length; i++) {
            let current = contents[i];
            let title = contents[i];
            if(this.props.titles) {
                title = this.props.titles[i];
            }
            items.push(
                <TouchableOpacity key={i} onPress={() => this.props.actionItem(i)}>
                    <IconCardComponent source={{uri: current.image, scale: 1}} content={title}/>
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
                <Row key={this.props.content.length + 1}>
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

const styles = StyleSheet.create({
    col: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }
})

const customTheme = {
    'holusion.IconCard': {
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

export default connectStyle('holusion.Playlist', styles)(Playlist)