import React from 'react';
import PropTypes from 'prop-types';
import { connect} from 'react-redux';

import { Container, Toast, Text, H2, View} from 'native-base';
import { StyleSheet} from 'react-native';

import {getActiveProduct, getActiveItems} from "@holusion/react-native-holusion/lib/selectors";

import { filename} from "@holusion/cache-control";

import { Layout } from '../Layout';

function ListScreenContent(props){
    let categoryData = props.config.categories.find(c=> c.name == props.selectedCategory)
    if(!categoryData){
      console.warn("Failed to find %s in ", props.selectedCategory, props.config.categories);
      return <View>
        <H2 primary>404</H2>
        <Text>
          L'application n'a peut-être pas été synchronisée?
          Relancer l'application si nécessaire
        </Text>
      </View>
    }
    let title = props.title || props.selectedCategory || null;
    let links = props.items.map(item =>{
        return {name: item.title, to: item.id}
    })

    return <Layout
      title={props.title|| props.selectedCategory}
      image={categoryData.thumb}
      links={links}
      navigate={props.onNavigate}
    />
}
ListScreenContent.propTypes = {
    selectedCategory: PropTypes.string,
    onNavigate: PropTypes.func,
}

const ConnectedListScreenContent = connect(function(state, props){
    return {
        items: getActiveItems(state, props),
        config: state.data.config,
    }
})(ListScreenContent);

class ListScreen extends React.Component {
    render() {
        const {category} = this.props.route.params?this.props.route.params :{};
        return (
            <Container style={{flex: 1}}>
                <ConnectedListScreenContent 
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

const styles = StyleSheet.create({
    container: {
    },
    titleContainer: {
        flex: 1,
        display: "flex",
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    cardContainer: {
        flex: 2,
        display: 'flex', 
        flexWrap: "wrap",
        flexDirection: "row", 
        alignContent: 'center', 
        justifyContent: 'center'
    },
    footerContainer: {
        display: 'flex', 
        justifyContent: 'center', 
        flexDirection: 'row',
        borderRadius: 8, 
        padding: 8, 
        shadowOffset: {
            width: 0, 
            height: 10
        }, 
        shadowOpacity: 0.8, 
        shadowRadius: 10,
        width: "90%",
        position: "absolute",
        bottom: 32
    },
    footerButton: {
        color: 'white', 
        fontSize: 28
    }
});
