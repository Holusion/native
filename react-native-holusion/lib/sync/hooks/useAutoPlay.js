import { usePlay } from "./usePlay";

import { useRoute } from '@react-navigation/native';
import { useSelector } from "react-redux";
import { getActiveProduct, getItems, getConfig } from "../../selectors";

/**
 * usePlay on steroids.
 * Direct connect to redux and react-navigation for fully automated play control on target product
 */
export function useAutoPlay(){
  const {params:{ category: categoryName, id }={}} = route = useRoute();
  const target = useSelector(getActiveProduct);
  const conf = useSelector(getConfig);
  const items = useSelector(getItems);
  let video;
  if(id){
    let item = items[id];
    if(!item){ 
      console.warn(`No item found for id : ${id}`);
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
  usePlay(video, target?target.url:undefined);
}
