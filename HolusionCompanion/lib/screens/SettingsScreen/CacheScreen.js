import React, { useEffect, useState } from "react";
import {ListItem, Text, View, Left, Right, Body, Icon, Button} from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { error, getFiles, getUncachedFiles, mediasPath } from "@holusion/cache-control";

import RNFS, { unlink } from "react-native-fs";

import SettingsHeader from "./SettingsHeader";
import { BgIcon, Bytes } from "../../components";
import { FlatList } from "react-native";

export function CachedFile({name, size, type, cached, required}){
  let icon, color, status;
  switch(type){
    case "image":
      icon="image";
      break;
    case "video":
      icon= "videocam";
      break;
    default:
      icon="document";
  }
  
  if(cached && required){
    color = "primary";
  }else if(required){
    color = "warning";
  }else{
    color = "light";
  }
  return <ListItem icon>
    <Left>
      <BgIcon status={color} name={icon}/>
    </Left>
    <Body>
      <Text>{name.slice(mediasPath().length+1)}</Text>
    </Body>
    <Right>
      <Bytes>{size}</Bytes>
    </Right>
  </ListItem>;
}

export function useLocalFiles(refresh){
  const [localFiles, setLocalFiles] = useState({files: [], loading: true});
  const depFiles = useSelector(getFiles);
  useEffect(()=>{
    let isCancelled = false;
    setLocalFiles({files: localFiles.files, loading: true});
    RNFS.readDir(mediasPath()).then(files=>files.map(f=>{
      let type = "application/octet-stream";
      if(/\.(png|jpe?g|bm|tga)$/i.test(f.path)){
        type = "image";
      }else if(/\.(mp4|mkv|ogv|mov)$/i.test(f.path)){
        type = "video";
      }else{
        //console.log("default type for : ", f.path);
      }
      return {name: f.path, type, size: f.size }
    }))
    .then(files=>{
      if(isCancelled) return;
      setLocalFiles({files, loading: false});
    })
    return ()=> isCancelled = true;
  }, [refresh, setLocalFiles, depFiles]);

  const allFiles = new Map();
  for(let file of localFiles.files){
    allFiles.set(file.name, {
      ...file, 
      required: !!depFiles[file.name],
      cached: true,
    });
  }
  for(let name in depFiles){
    if(!allFiles.has(name)){
      let d = depFiles[name];
      let type = /^(\w+)\//.exec(d["contentType"])[1];
      allFiles.set(name, {
        name, 
        size:d.size, 
        type,
        required: true,
        cached: false,
      })
    }
  }
  return [Array.from(allFiles.values()), localFiles.loading];
}
export function useLocalSize(){
  const [files, loading] = useLocalFiles(0);
  return files.reduce((s, f)=> s+f.size, 0);
}
export function CachePartSize({name, color, size}){
  return       <View style={{display: "flex", flexDirection: "row"}}>
  <Icon name="ellipse" style={{color: BgIcon.colors[color], fontSize: 13, lineHeight: 13}}/>
  <Bytes style={{fontSize:13, lineHeight: 13}}>{size}</Bytes>
  <Text style={{fontSize:13, lineHeight: 13}}> {name}</Text>
</View>
}

export default function CacheScreen(){
  const dispatch = useDispatch();
  const [cleaning, setCleaning] = useState(false);
  const [refreshKey, setRefresh] = useState(0);
  const [files, loading] = useLocalFiles(refreshKey);

  const size = files.reduce((s, f)=> s+f.size, 0);
  const requiredSize = files.reduce((s, f)=> s + (f.required?f.size:0), 0);
  const missingSize = files.reduce((s, f)=> s+ ((f.required && !f.cached)?f.size:0), 0);

  const data = files.sort((a, b)=> b.size - a.size);

  useEffect(()=>{
    if(!cleaning) return;
    let isCancelled = false;
    const unusedFiles = files.filter(f=> !f.required && f.cached)
    Promise.all(unusedFiles.map((f)=> RNFS.unlink(f.name)))
    .then(()=>{
      setRefresh(refreshKey+1);
      setCleaning(false);
    })
    .catch((e)=>{
      dispatch(error("CACHE_CLEAN",`Failed to clean cache`, e.toString()));
    })
    return ()=> isCancelled = true;
  }, [cleaning, setCleaning, setRefresh, files]);

  return <View style={{backgroundColor:"white", height: "100%"}}>
    <SettingsHeader back>
      <Text>Cache (<Bytes>{size}</Bytes>)</Text>
    </SettingsHeader>
    
    <FlatList
      refreshing={loading||cleaning}
      onRefresh={()=>setRefresh(refreshKey+1)}
      ListEmptyComponent={<Text>Aucun fichier en cache</Text>}
      ListHeaderComponent={(<View style={{paddingHorizontal: 8}}>
        {!(loading|| cleaning) &&<View style={{display:"flex", flexDirection: "row", justifyContent:"space-evenly", paddingVertical: 8}}>
          <CachePartSize name="Utile" color="default" size={requiredSize}/>
          <CachePartSize name="Manquant" color="warning" size={missingSize}/>
          <CachePartSize name="Obsolète" color="muted" size={size -requiredSize}/> 
        </View>}
        <View style={{display:"flex", flexDirection: "row", justifyContent:"flex-end"}}>
          <Button style={{borderColor:"#666666"}} disabled={loading || cleaning}  bordered iconLeft small onPress={()=>setCleaning(true)}>
            <Icon style={{color:"#666666"}} name="trash"/>
            <Text style={{color:"#666666"}} >Nettoyer</Text>
          </Button>
        </View>
      </View>)}
      data={data}
      keyExtractor={({name})=>(`${name}`)}
      renderItem={({item})=>(<CachedFile {...item}/>)}
    />
  </View>
}
