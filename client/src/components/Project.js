import React, {useContext, useState} from "react";
import { Link } from "react-router-dom";

import { useCollection } from 'react-firebase-hooks/firestore';

import FirebaseContext from "../context";

import ErrorMessage from "./ErrorMessage";
import Loader from "./Loader";

export default function Project(props){
  const project_id = props.match.params.project;
  const [submitting, setSubmit] = useState(false);
  const firebase = useContext(FirebaseContext);
  const ref = firebase.firestore().collection(`applications/${project_id}/projects`);
  const [value, loading, error] = useCollection(
    ref
  )
  function createName(e){
    e.preventDefault();
    const form = e.target;
    const name = form["project-name"].value
    if(!name) {
      alert("Use a valid name");
      return;
    }
    setSubmit(true);
    console.info("create project in "+project_id+" with name : ", name);
    ref.doc(name).set({title:name})
    .catch((e)=>alert(e))
    .then(()=>{
      setSubmit(false);
    })
  }

  return(<div className="container">
    {error && <ErrorMessage message={error.toString()}/>}
    {loading && <Loader/>}
    {value && (<React.Fragment>
      <h1 className="text-primary">Items : </h1>
      <ul className="list-group">
        {value.docs.map(doc => (
          <li className="list-group-item" key={doc.id} >
            <Link to={`/projects/${project_id}/${doc.id}`}>{doc.id}</Link>
          </li>
        ))}
        <li className="list-group-item p-2">
          <form className="form-inline" onSubmit={createName}>
            <div className="input-group mr-sm-2">
              <div className="input-group-prepend">
                <div className="input-group-text">+</div>
              </div>
              <input disabled={submitting} type="text" className="form-control" id="inlineFormInputGroupUsername2" name="project-name" placeholder="Name"/>
              <div className="input-group-append">
                <button disabled={submitting} className="btn btn-outline-secondary">Créer</button>
                {submitting && <div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div>}
              </div>
            </div>
          </form>
        </li>
      </ul>
        
    </React.Fragment>)}
  </div>)
}