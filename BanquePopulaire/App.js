import {createStackNavigator} from 'react-navigation'
import HomeScreen from './screens/HomeScreen'
import QuestionScreen from './screens/QuestionScreen';
import AnswerScreen from './screens/AnswerScreen';

export default createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: () => ({
      title: "Route du Rhum 2018 Destination Guadeloupe"
    })
  },
  Question: {
    screen: QuestionScreen,
    navigationOptions: () => ({
      title: "Route du Rhum 2018 Destination Guadeloupe",
      headerBackTitle: "Back"
    })
  },
  Answer: {
    screen: AnswerScreen,
    navigationOptions: () => ({
      title: "Route du Rhum 2018 Destination Guadeloupe",
      headerBackTitle: "Back"
    })
  }
})
