import * as React from 'react';

import { getConfig } from '@holusion/cache-control';
import { StyleSheet } from 'react-native';

import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { HeaderBackButton } from '@react-navigation/stack';


import { useSelector } from 'react-redux';
import ObjectScreen from './ObjectScreen';


//const Nav = createMaterialTopTabNavigator();
const Nav = createNativeStackNavigator();
//const Nav = createStackNavigator();

export default function CategoryNavigator() {
  let { categories = [] } = useSelector(getConfig);
  if(!categories.length) categories = [{name: "Undefined"}];

  return (<Nav.Navigator screenOptions={({ navigation }) => ({ headerShown: true, headerLeft: () => (<HeaderBackButton label="Retour" onPress={() => navigation.goBack()} />) })}>
    {categories.map(({ name }, index) => (<Nav.Screen key={index} name={name} component={ObjectScreen} />))}
  </Nav.Navigator>)
}

const styles = StyleSheet.create({
  "404Content": {
    marginHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 100,
  },
  footer: {
    position: "absolute",
    bottom: 15,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },

})
