import React from 'react';
import PropTypes from 'prop-types';
import {getActiveItems} from "../selectors";
import { connect} from 'react-redux';

import { Container, Toast, Content, Text, H2, View} from 'native-base';
import { StyleSheet, TouchableOpacity} from 'react-native';


import ImageCard from '../components/ImageCard';
import AppState from "./AppState";
function ListObjects(props){
    let title = props.title || props.selectedCategory || null;
    let cards = props.items.map(item =>{
        //Ugly hack because Images with a file:/// uri are not rendered when updated unless we restart the app
        const thumbSource = item['thumb']? {uri: item['thumb'].replace(/file:\/\/\/.*\/Documents/,"~/Documents"), scale: 1} : require("../../assets/icons/catalogue.png");
        return (<TouchableOpacity key={item['id']} onPress={()=>props.onNavigate(item['id'])}>
                <ImageCard source={thumbSource} title={item.title} />
        </TouchableOpacity>)
    })

    if(cards.length === 0){
        title = "Aucun élément à afficher"
        cards=(<View style={{flex:1}}>
          <Text style={{paddingBottom:50}}>
            L'application n'a peut-être pas été synchronisée?
          </Text>
          <View>
            <AppState/>
          </View>
        </View>)
    }

    return(<Content contentContainerStyle={styles.container}>
        {title && <View style={styles.titleContainer}>
            {typeof title === "string" ?<H2 primary style={{ paddingTop:30 }}>{title}</H2> : title }
        </View>}
        <View style= {styles.cardContainer}>
            {cards}
        </View>
    </Content> )
}

ListObjects.propTypes = {
    selectedCategory: PropTypes.string,
    onNavigate: PropTypes.func.isRequired,
}

export default ConnectedListObjects = connect(function(state, props){
    return {
        items: getActiveItems(state, props),
    }
})(ListObjects);

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
      alignContent: "space-around",
      justifyContent: 'space-evenly',
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