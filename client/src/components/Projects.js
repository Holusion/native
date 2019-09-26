import React, {useContext} from "react";
import { Link } from "react-router-dom";

import { useCollection } from 'react-firebase-hooks/firestore';
import FirebaseContext from "../context";

import ErrorMessage from "./ErrorMessage";
import Loader from "./Loader";

export default function Projects(props){
  const firebase = useContext(FirebaseContext);
  const [value, loading, error] = useCollection(
    firebase.firestore().collection('applications')
  )
  return(<div className="container">
    {error && <ErrorMessage message={error.toString()}/>}
    {loading && <Loader/>}
    {value && (<React.Fragment>
      <h1 className="text-primary">Applications : </h1>
      <ul className="list-group">
        {value.docs.map(doc => (
          <li className="list-group-item" key={doc.id} >
            <Link to={`/projects/${doc.id}`}>{doc.id}</Link>
          </li>
        ))}
      </ul>
        
    </React.Fragment>)}
  </div>)
}