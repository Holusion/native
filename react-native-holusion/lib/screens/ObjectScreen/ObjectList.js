import React, {useCallback} from "react";

import { FlatList } from 'react-native';

import ObjectView from "./ObjectView";


const viewabilityConfig = {
  viewAreaCoveragePercentThreshold: 65
}

/**
 * Optimized FlatList that reduces re-renders
 */
export default React.memo(React.forwardRef(function ObjectList ({items, initialItem, size, views, onChange}, ref){
  const onViewChanged = useCallback(({changed: items})=>{
      //There should only be one item viewable at a time
      if(items[0].isViewable === true){
          onChange(items[0].index);
      }
  }, []);
  return <FlatList
      ref={ref}
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
      style={{...size}}
      useNativeDriver={true}
      data={items}
      keyExtractor={(item, index) => `${item.id}`}
      renderItem={({ item }) => {
          return (<ObjectView views={views} width={size.width} item={item}/>)
      }}
  />
}), function areEqual(prevProps, nextProps) {
  const changedProps = Object.keys(nextProps)
  .filter(p => nextProps[p] !== prevProps[p] && p !== "initialItem")
  return (changedProps.length === 0)? true : false;
});
