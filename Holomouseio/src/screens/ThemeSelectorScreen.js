import React from 'react';
import { Content } from 'native-base';
import { Text, StyleSheet, View } from 'react-native';

import { network, ListItem, assetManager } from '@holusion/react-native-holusion'

export default class ThemeSelectorScreen extends React.Component {

    componentDidMount() {
        network.activeAll(this.props.navigation.getParam('url'));
    }

    render() {
        let allList = [];
        let actualSelection = this.props.navigation.getParam('type') === 'catalogue' ? assetManager.allCatalogue : assetManager.allTheme;
        let title = this.props.navigation.getParam('type') === 'catalogue' ? 'Collection : ' : 'Thème : ';
        let catchphrase = this.props.navigation.getParam('type') === 'catalogue' ? 'Choisissez une collection' : 'Choisissez un thème';

        for(let i = 0; i < actualSelection.length; i++) {
            let isPurple = (i % 2 == 0);
            let backgroundColor = isPurple ? "#ae2573ff" : null;
            let color = isPurple ? "white" : "#3c0c27ff";

            allList.push(
                <ListItem key={i} style={[{backgroundColor: backgroundColor}, styles.listItem]} onPress={() => this._onSelection(actualSelection[i])}>
                    <View>
                        <Text style={[{color: color}, styles.selectionText]}>{title}</Text>
                        <Text style={[{color: color}, styles.selectionText]}>{actualSelection[i].replace('Thème : ', '')}</Text>
                    </View>
                </ListItem>
            );
        }

        return (
            <Content>
                <View>
                    <Text  style={styles.catchPhrase}>{catchphrase}</Text>
                </View>
                <View style={{borderWidth: 1, borderColor: '#ccccccff', marginLeft: 24, marginRight: 24}}></View>
                <View>
                    { allList }
                </View>
            </Content>
        )
    }

    constructor(props, context) {
        super(props, context);

        this.props.navigation.addListener('willFocus', payload => {
            network.activeAll(this.props.navigation.getParam('url'));
        })

        this._onSelection = this._onSelection.bind(this);
    }

    _onSelection(name) {
        let realType = this.props.navigation.getParam('type') === "catalogue" ? 'Collections' : 'Theme'
        let objs = assetManager.getObjectFromType(realType, name);

        if(realType === "Theme") {
            this.props.navigation.push('Object', {
                objList: objs,
                objId: 0,
                url: this.props.navigation.getParam('url')
            });
        } else {
            this.props.navigation.push("Catalogue", {
                objList: objs,
                url: this.props.navigation.getParam('url')
            })
        }
    }
}

const styles = StyleSheet.create({
    catchPhrase: {
        color: "#ae2573ff",
        fontSize: 32,
        margin: 24,
        textAlign: 'left'
    },
    
    selectionText: {
        fontSize: 26,
        paddingLeft: 16
    },

    listItem: {
        height: 128,
        padding: 16
    }
});