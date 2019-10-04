import React, {useContext} from "react";
import { Link } from "react-router-dom";

import { useCollection } from 'react-firebase-hooks/firestore';
import FirebaseContext from "../context";

import ErrorMessage from "./ErrorMessage";
import Loader from "./Loader";

import Card from "./Card";


export default function Projects(props){
  const firebase = useContext(FirebaseContext);
  const [value, loading, error] = useCollection(
    firebase.firestore().collection('applications').where("contributors", "array-contains", props.user.uid)
  )
  let list;
  if(loading){
    list = (<Loader/>)
  }else if(!value || value.docs.length === 0){
    list = (<div>
      <h1>Aucune application associée à ce compte.</h1>
      <h3>Demandez l'activation de votre application en communiquant votre identifiant unique : </h3>
      <div className="input-group mb-3">
        <input readOnly type="text" class="form-control" placeholder="uid" aria-label="user-uid" aria-describedby="user-uid" value={props.user.uid}/>
      </div>
    </div>)
  }else{
    list = (<React.Fragment>
      <h1 className="text-primary">Applications : </h1>
      <div className="card-group">
        {value.docs.map(doc => (<Card key={doc.id} image={doc.image} title={doc.id} url={`/projects/${encodeURIComponent(doc.id)}`}/>))}
      </div>
        
    </React.Fragment>)
  }

  return(<div className="container">
    {error && <ErrorMessage message={error.toString()}/>}
    {list}
  </div>)
}