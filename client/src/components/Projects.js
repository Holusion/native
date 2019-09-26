import React, {useContext} from "react";
import { Link } from "react-router-dom";

import { useCollection } from 'react-firebase-hooks/firestore';
import FirebaseContext from "../context";


export default function Projects(props){
  const firebase = useContext(FirebaseContext);
  const [value, loading, error] = useCollection(
    firebase.firestore().collection('applications')
  )
  return(<div className="container">
    {error && <strong>Error: {JSON.stringify(error)}</strong>}
    {loading && <span>Collection: Loading...</span>}
    {value && (<React.Fragment>
      <h1>Applications : </h1>
      <div style={{align:"left"}}>
        {value.docs.map(doc => (
          <div key={doc.id} >
            <Link to={`/projects/${doc.id}`}>{doc.id}</Link>
          </div>
        ))}
      </div>
        
    </React.Fragment>)}
  </div>)
}