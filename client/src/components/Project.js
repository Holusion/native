import React, {useContext, useState} from "react";
import { Link } from "react-router-dom";

import Octicon, {Plus} from '@primer/octicons-react'

import { useCollection, useDocument } from 'react-firebase-hooks/firestore';

import FirebaseContext from "../context";

import ErrorMessage from "./ErrorMessage";
import Loader from "./Loader";

import Card from "./Card";
import {TitleFormInput} from "./Inputs";

export default function Project(props){
  const project_id = props.match.params.project;
  const [submitting, setSubmit] = useState(false);
  const firebase = useContext(FirebaseContext);
  const itemsRef = firebase.firestore().collection(`applications/${project_id}/projects`);
  const [items, loadingItems, errorItems] = useCollection(
    itemsRef
  )
  
  const projectRef = firebase.firestore().doc(`applications/${project_id}`);
  const [projectDataDoc, loadingProject, errorProject] = useDocument(
    projectRef
  );
  
  const loading = loadingItems || loadingProject;
  const error = errorItems || errorProject;

  const projectData = (!loadingProject && projectDataDoc)? projectDataDoc.data(): {};




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
    itemsRef.doc(name).set({title:name})
    .catch((e)=>alert(e))
    .then(()=>{
      setSubmit(false);
    })
  }
  const cardWrapperProps = {
    style:{maxWidth:"18rem", minWidth:"18rem"},
    className: "m-2 m-xl-4",
  }
  const cards = [(<div key="Create-card" {...cardWrapperProps}>
    <div className="card" style={{height:"100%"}} >
      <div className="card-body">
        <h5 className="card-title">Créer un élément</h5>
      </div>
      <div className="card-body" onSubmit={createName}>
        <div className="card-text">
          <form className="form-group"  onSubmit={createName}>
            <div className="input-group mr-sm-2">
              <div className="input-group-prepend">
                <div className="input-group-text">+</div>
              </div>
              <input disabled={submitting} type="text" className="form-control" id="inlineFormInputGroupUsername2" name="project-name" placeholder="Nom"/>
              <div className="input-group-append">
                <button disabled={submitting} className="btn btn-outline-secondary">
                  Créer          
                  {submitting && <div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>)]

  if (items){
    cards.push (...items.docs.map(doc => {
      const {title, thumb, image} = doc.data();
      return(<div key={doc.id} {...cardWrapperProps}>
        <Card  url={`/projects/${project_id}/${doc.id}`} title={title} thumb={thumb} image={image}/>
      </div>)
    }));
  }

  function onProjectChange(e){
    e.preventDefault();
    const name= e.target.name;
    const value = e.target.value;

    setSubmit(true);
    projectRef.set({[name]: value}, {merge: true})
    .catch(e=>{
      alert(e);
    })
    .then(()=> setSubmit(false))
    return false;
  }

  return(<div className="">
    {error && <ErrorMessage message={error.toString()}/>}
    {loading && <Loader/>}
    {items && (<React.Fragment>
      <div className="container">
        <h1>Projet: </h1>
        <TitleFormInput onChange={onProjectChange} title="Repository"  name="repo" value={projectData.repo || ""} />
        <TitleFormInput onChange={onProjectChange} title="Layout"  name="layout" value={projectData.layout || ""}/>
      </div>
      <div className="container">
        <h2 className="text-primary">Items : </h2>
      </div>
      <div className="container-fluid">
        <div className="card-group justify-content-center align-items-stretch">
          {cards}
        </div>
      </div>
      
    </React.Fragment>)}
  </div>)
}