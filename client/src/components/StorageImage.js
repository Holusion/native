import React, {useContext} from "react"
import FirebaseContext from "../context";

import { useDownloadURL } from 'react-firebase-hooks/storage';

import Loader from "./Loader";

export default function StorageImage({source, ...props}){
  const firebase = useContext(FirebaseContext);
  const [image, loading, error] = useDownloadURL(
    firebase.storage().refFromURL(source)
  );
  if(loading) return <Loader/>
  return (<img src={image} {...props} />)
}