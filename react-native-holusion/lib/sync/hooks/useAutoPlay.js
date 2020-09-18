import { usePlay } from "./usePlay";

import { useIsFocused, useRoute } from '@react-navigation/native';
import { useSelector } from "react-redux";
import { getActiveProduct, getItems, getConfig } from "../../selectors";

/**
 * usePlay on steroids.
 * Direct connect to redux and react-navigation for fully automated play control on target product
 * Should be inserted in any component that requires video synchronization. 
 * It infer active video from route parameters : 
 * - id : display corresponding page's video
 * - category : display this category's video
 * - <default> : display the configured default video
 * 
 * For class components, use the wrapAutoPlay HOC.
 */
export function useAutoPlay(){
  const {params:{ category: categoryName, id }={}} = route = useRoute();
  const isFocused = useIsFocused();
  const target = useSelector(getActiveProduct);
  const conf = useSelector(getConfig);
  const items = useSelector(getItems);
  let video;
  if(id){
    let item = items[id];
    if(!item){ 
      console.warn(`No item found for id : ${id} in [${Object.keys(items).join(", ")}]`);
    }else{
      video = item.video;
    }
  }else if(categoryName){
    if(conf.categories){
      let category = conf.categories.find(({name})=> name === categoryName);
      if(!category){
        console.warn(`No category found for name ${categoryName} in ${conf.categories}`);
      }else{
        video = category.video;
      }
    }
  }

  video = video || conf.video;
  let url = target? target.url:undefined;
  usePlay(isFocused?video: undefined, url);
  return [video, url, isFocused];
}


export function wrapAutoPlay(Component){
  return function AutoPlayWrapper(props){
    useAutoPlay();
    return (<Component {...props}/>);
  }
}