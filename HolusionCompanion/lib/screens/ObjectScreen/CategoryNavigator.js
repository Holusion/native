import * as React from 'react';

import { getConfig } from '@holusion/cache-control';
import { connectStyle } from 'native-base';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HeaderBackButton } from '@react-navigation/elements';


import { connect, useSelector } from 'react-redux';
import {default as RawObjectScreen} from './ObjectScreen';
import { NetworkIcon } from '../../components';
import { withErrorHandler } from '../../containers';

const ObjectScreen = withErrorHandler(RawObjectScreen);

//const Nav = createMaterialTopTabNavigator();
const Nav = createNativeStackNavigator();
//const Nav = createStackNavigator();


class CategoryNavigator extends React.Component {
  screenOptions = ({ navigation, route:{name, params={}}})=>{
    return {
      headerShown: true,
      title: params.title || name,
      headerStyle: this.props.style.header,
      headerTitleStyle: this.props.style.title,
      headerLeft: () => ((navigation.canGoBack())?(<HeaderBackButton key="headerLeft" label="Retour" onPress={() => navigation.goBack()} />) : null),
      headerRight: ()=>(<NetworkIcon key="headerRight" onPress={() => navigation.navigate("Settings")}/>),
    }
  }
  render(){
    let categories = this.props.categories || [];
    return (<Nav.Navigator screenOptions={this.screenOptions}>
      {[...categories, {name: "Undefined"}].map(({ name }, index) => (<Nav.Screen key={index} name={name} component={ObjectScreen} />))}
    </Nav.Navigator>)
  }
}
const StyledCategoryNavigator = connectStyle('Holusion.CategoryNavigator', {})(CategoryNavigator);
export default connect((state)=>({categories: getConfig(state).categories}))(StyledCategoryNavigator);