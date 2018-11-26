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
      title: "Holomouseio - Accueil",
      headerLeft: null
    })
  },
  Selection: {
    screen: ThemeSelectorScreen,
    navigationOptions: () => ({
      title: "Holomouseio - Sélection"
    })
  },
  Catalogue: {
    screen: CatalogueScreen,
    navigationOptions: () => ({
      title: "Holomouseio - Catalogue"
    })
  },
  Object: {
    screen: ObjectScreen,
    navigationOptions: () => ({
      title: "Holomouseio - Contenus"
    })
  },
  End: {
    screen: EndScreen,
    navigationOptions: () => ({
      title: "Holomouseio - Fin",
      headerLeft: null
    })
  }
})
