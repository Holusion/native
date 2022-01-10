import React, {useCallback} from "react";

import { FlatList } from 'react-native';

import ObjectView from "../../components/Views/ObjectView";


const viewabilityConfig = {
  viewAreaCoveragePercentThreshold: 65
}

export class ObjectList extends React.Component {
  shouldComponentUpdate(nextProps){
    const changedProps = Object.keys(nextProps)
    .filter(p => nextProps[p] !== this.props[p] && p !== "initialItem")
    return (changedProps.length === 0)? false : true;
  }

  onViewChanged = ({changed: items})=>{
    //There should only be one item viewable at a time.
    if(items.length == 2){
      //we're in a "replace" update
      return
    }else if(typeof this.props.onChange === "function" && items[0].isViewable === true){
      //console.log("onChange : ", items.map(i=>`${i.item.id} - ${i.index}: ${i.isViewable}`));
      this.props.onChange(items[0].index);
    }
  }

  render(){
    const {items, initialItem, size, views, onChange} = this.props;
    return (<FlatList
      testID="object-flatlist"
      ref={this.props.innerRef}
      getItemLayout={(_, index) => ( {length: size.width, offset: size.width * index, index})}
      horizontal
      //Performance tuning (https://reactnative.dev/docs/optimizing-flatlist-configuration)
      initialNumToRender={1}
      maxToRenderPerBatch={2}
      windowSize={3} //Number of items that will be kept rendered
      initialScrollIndex={initialItem}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={this.onViewChanged}
      snapToAlignment={"start"}
      pagingEnabled={true}
      scrollEnabled={typeof onChange === "function"}
      style={{...size}}
      useNativeDriver={true}
      data={items}
      keyExtractor={(item) => `${item.id}`}
      renderItem={({ item }) => {
          return (<ObjectView views={views} width={size.width} item={item}/>)
      }}
    />)
  }
}


export default React.forwardRef((props, ref)=>(<ObjectList innerRef={ref} {...props}/>));