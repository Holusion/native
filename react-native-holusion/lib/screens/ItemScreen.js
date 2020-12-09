import * as React from 'react';
import { useWindowDimensions, StyleSheet} from 'react-native';
import {
  createNavigatorFactory,
  NavigationHelpersContext,
  useNavigationBuilder,
  TabRouter,
  TabActions,
} from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { useSelector } from 'react-redux';
import { getItems, getItemsArray } from '@holusion/cache-control';
import ObjectView from './ObjectScreen/ObjectView';
import { ObjectList } from './ObjectScreen/ObjectList';


import { Container, Content, Footer, H1, View, Text } from 'native-base';
import { FlatList } from 'react-native-gesture-handler';
import { Controller } from '../containers';


const viewabilityConfig = {
  viewAreaCoveragePercentThreshold: 65
}

function ItemNavigator({
  initialRouteName,
  children,
  screenOptions,
}) {
  const ref = React.useRef(null);
  const { state, navigation, descriptors } = useNavigationBuilder(TabRouter, {
    children,
    screenOptions,
    initialRouteName,
  });
  const size = useWindowDimensions();
  //console.log("State : ", state)
  //console.log("Descriptors: ", descriptors)
  const initialItem = state.index;
  console.log("InitialItem : ", initialItem);

  const onViewChanged = React.useCallback((s)=> {
    let target = s.changed.find(i=>i.isViewable);
    if(!target) return;
    navigation.dispatch({
      ...TabActions.jumpTo(target.name),
      target: state.key,
    })
  },[navigation]);

  React.useEffect(()=>{
    if(!ref.current) return;
    ref.current.scrollToIndex({
      index: state.index
    })
  }, [state.index]);
  /*
  return (<NavigationHelpersContext.Provider value={navigation}>
    <Container>
      <View style={{flex: 1, height: 1000, display: "flex", flexDirection:"row", alignItems: "stretch"}}>
      {descriptors[state.routes[state.index].key].render()}
      </View>
      <Footer style={styles.footer}>
          <Controller
              prev={state.index !== 0 ? () => console.log("JUMP TO", state.routes[state.index-1].name) : null} 
              next={null}
          />
      </Footer>
    </Container>
  </NavigationHelpersContext.Provider>)
  //*/

  const scrollTo = (idx)=>{
    navigation.dispatch({ ...TabActions.jumpTo(state.routes[idx].name), target: state.key});
    if(!ref.current) return;
    ref.current.scrollToIndex({
      animated : Math.abs(idx-state.index) === 1, 
      index: idx
    });
  };

  return (
    <NavigationHelpersContext.Provider value={navigation}>
      <FlatList
      ref={ref}
      testID="object-flatlist"
      getItemLayout={(_, index) => ( {length: size.width, offset: size.width * index, index})}
      horizontal
      //Performance tuning (https://reactnative.dev/docs/optimizing-flatlist-configuration)
      initialNumToRender={1}
      maxToRenderPerBatch={2}
      windowSize={3} //Number of items that will be kept rendered
      initialScrollIndex={initialItem}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewChanged}
      snapToAlignment={"start"}
      pagingEnabled={true}
      scrollEnabled={typeof onViewChanged === "function"}
      style={{...size}}
      useNativeDriver={true}
      data={state.routes}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => {
        return descriptors[item.key].render();
      }}
    />

    <Footer style={styles.footer}>
      <Controller
        prev={state.index !== 0 ? ()=> scrollTo(state.index -1) : null} 
        next={state.index < state.routes.length - 1? ()=>scrollTo(state.index +1) : null}
      />
    </Footer>
    </NavigationHelpersContext.Provider>
  );
}

export const createItemNavigator = createNavigatorFactory(ItemNavigator);

const Nav = createItemNavigator();
//const Nav = createMaterialTopTabNavigator();
export default function ItemScreen(props){
  const initialScreen = props.route.params.screen;
  const items = useSelector(getItemsArray);
  const selectedItem = items.find(i=> i.id === initialScreen);
  const selectedItems = items.filter(i=> i.category == selectedItem.category);
  return (<Container>
    <Nav.Navigator lazy lazyPreloadDistance={1} tabBar={()=>null} >
      {selectedItems.map(i =>(<Nav.Screen key={i.id} name={i.id} component={Item} />))}
    </Nav.Navigator>
</Container>)
}

const styles = StyleSheet.create({
  "404Content": {
      marginHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 100,
  },
  footer:{
      position:"absolute",
      bottom:15,
      flex:1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderWidth:0,
      borderColor: 'transparent',
  },
  
})

function Item({route, navigation, ...props}){
  const size = useWindowDimensions();
  const item = useSelector((state)=>getItems(state)[route.name]);
  return <View style={{flex: 1, height: 1000, display: "flex", flexDirection:"row", alignItems: "stretch"}}>
    <ObjectView item={item} width={size.width}/>
  </View>
}