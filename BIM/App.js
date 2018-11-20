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
      title: "BIM - Accueil",
      headerLeft: null
    })
  },
  Selection: {
    screen: ThemeSelectorScreen,
    navigationOptions: () => ({
      title: "BIM - Sélection"
    })
  },
  Catalogue: {
    screen: CatalogueScreen,
    navigationOptions: () => ({
      title: "BIM - Catalogue"
    })
  },
  Object: {
    screen: ObjectScreen,
    navigationOptions: () => ({
      title: "BIM - Contenus"
    })
  },
  End: {
    screen: EndScreen,
    navigationOptions: () => ({
      title: "BIM - Fin",
      headerLeft: null
    })
  }
})
