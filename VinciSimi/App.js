import {createStackNavigator} from 'react-navigation'
import ObjectScreen from './src/screens/ObjectScreen'
import HomeScreen from './src/screens/HomeScreen';
import ThemeSelectorScreen from './src/screens/ThemeSelectorScreen';
import EndScreen from './src/screens/EndScreen';
import CatalogueScreen from './src/screens/CatalogueScreen';

export default createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: () => ({
      title: "Vinci Simi - Accueil",
      headerLeft: null
    })
  },
  Selection: {
    screen: ThemeSelectorScreen,
    navigationOptions: () => ({
      title: "Vinci Simi - Sélection"
    })
  },
  Catalogue: {
    screen: CatalogueScreen,
    navigationOptions: () => ({
      title: "Vinci Simi - Catalogue"
    })
  },
  Object: {
    screen: ObjectScreen,
    navigationOptions: () => ({
      title: "Vinci Simi - Contenus"
    })
  },
  End: {
    screen: EndScreen,
    navigationOptions: () => ({
      title: "Vinci Simi - Fin",
      headerLeft: null
    })
  }
})
