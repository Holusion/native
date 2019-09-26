import React, {useContext} from "react";
import FirebaseContext from "../context";

import { useDownloadURL } from 'react-firebase-hooks/storage';


export default function BackgroundImage(props){
  const firebase = useContext(FirebaseContext);
  console.log("Source : ", props.source);
  const [value, loading, error] = useDownloadURL(
    firebase.storage().refFromURL(props.source)
  );
  if(!props.source || error || loading){
    return (<div className="background-image">{error}</div>);
  }
  return(
    <div className="background-image" style={{backgroundImage:`url(${value})`}}></div>
  )
}