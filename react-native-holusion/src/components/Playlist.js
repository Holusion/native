import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Grid, Col, Row, StyleProvider, connectStyle } from 'native-base';
import RNFS from 'react-native-fs';

import IconCard from './IconCard';

export class Playlist extends React.Component {

    renderContent() {
        let rows = [];
        let items = []
        for(let i = 0; i < this.props.content.length; i++) {
            let current = this.props.content[i];
            let imageUri = `file://${RNFS.DocumentDirectoryPath}/${current}.jpg`;
            items.push(
                <TouchableOpacity key={i} onPress={() => this.props.actionItem(i)}>
                    <IconCard source={{uri: imageUri, scale: 1}} content={current}/>
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
                <Text style={styles.catchPhrase}>Choisissez un objet</Text>
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

    constructor(props, context) {
        super(props, context);
    }
}

const styles = StyleSheet.create({
    catchPhrase: {
        color: "#ae2573ff",
        fontSize: 32,
        margin: 24,
        textAlign: 'left'
    },
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