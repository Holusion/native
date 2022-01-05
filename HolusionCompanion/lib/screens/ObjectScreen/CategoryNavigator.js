import * as React from 'react';

import { getConfig, getItems } from '@holusion/cache-control';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HeaderBackButton } from '@react-navigation/elements';


import { connect, useSelector } from 'react-redux';
import {default as RawCategoryScreen} from './CategoryScreen';
import { NetworkIcon } from '../../components';
import { withErrorHandler } from '../../containers';
import { getItemsArray } from '@holusion/cache-control';

const CategoryScreen = withErrorHandler(RawCategoryScreen);

//const Nav = createMaterialTopTabNavigator();
const Nav = createNativeStackNavigator();
//const Nav = createStackNavigator();


function CategoryNavigator(props){
  const screenOptions = ({ navigation, route:{name, params={}}})=>{
    return {
      headerBackTitle: "Retour",
      headerShown: true,
      title: params.title || name,

      headerLeft: () => ((navigation.canGoBack())?(<HeaderBackButton key="headerLeft" label="Retour" onPress={() => navigation.goBack()} />) : null),
      headerRight: ()=>(<NetworkIcon key="headerRight" onPress={() => navigation.navigate("Settings")}/>),
    }
  }
  let categories = props.categories.map(c => c.name) || [];

  //item with undefined category have his own category added in the cache control
  let undefinedCategories = Object.values(props.items).filter(c => c.id == c.category).map(c => c.category)

  return (<Nav.Navigator screenOptions={screenOptions}>
    {[...categories, ...undefinedCategories].map(( name , index) => (<Nav.Screen key={index} name={name} component={CategoryScreen} />))}
  </Nav.Navigator>)
}


export default connect((state)=>({
  categories: getConfig(state).categories,
  items: getItems(state)
}))(CategoryNavigator);