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

        let collectionToColor = {};

        for(let obj in assetManager.yamlCache) {
            if(assetManager.yamlCache[obj].color) {
                collectionToColor[assetManager.yamlCache[obj].Collections] = assetManager.yamlCache[obj].color;
            }
        }

        let selectionSort = actualSelection.slice();
        selectionSort.sort((a, b) => {
            if(collectionToColor[a].localeCompare(collectionToColor[b]) == 0) {
                return a.localeCompare(b);
            }
        });

        for(let i = 0; i < selectionSort.length; i++) {
            let isPurple = (i % 2 == 0);
            let backgroundColor = isPurple ? "#005797ff" : null;
            let color = isPurple ? "white" : "#00334cff";

            for(let collections in collectionToColor) {
                if(collections === selectionSort[i]) {
                    backgroundColor = collectionToColor[collections];
                    color = 'white'
                }
            }

            allList.push(
                <ListItem key={i} style={[{backgroundColor: backgroundColor, borderBottomColor: 'white', borderBottomWidth: 1}, styles.listItem]} onPress={() => this._onSelection(selectionSort[i])}>
                    <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}>
                        {/* <Text style={[{color: color}, styles.selectionText]}>{title}</Text> */}
                        <Text style={[{color: color}, styles.selectionText]}>{selectionSort[i].replace('Thème : ', '')}</Text>
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
        color: "#005797ff",
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