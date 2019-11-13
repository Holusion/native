import React, {useContext, useState, useEffect} from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import Octicon, {Trashcan} from '@primer/octicons-react'
import { useDocument } from 'react-firebase-hooks/firestore';

import FirebaseContext from "../context";

import ErrorMessage from "./ErrorMessage";
import Loader from "./Loader";


import {FormSelector, TitleFormInput, AddLink} from "./Inputs";


import WikiLayout from "./layouts/Wiki";
import QALayout from "./layouts/QA";

export default function Item(props){
  const [submitting, setSubmit] = useState(false);
  const [medias, setMedias] = useState({images:[], videos:[], loaded: false});
  const project_id = props.match.params.project;
  const item_id = props.match.params.item;
  const firebase = useContext(FirebaseContext);
  const itemRef = firebase.firestore().doc(`applications/${project_id}/projects/${item_id}`);
  const [itemDataDoc, loadingItem, errorItem] = useDocument(
    itemRef
  );
  const projectRef = firebase.firestore().doc(`applications/${project_id}`);
  const [projectDataDoc, loadingProject, errorProject] = useDocument(
    projectRef
  );
  
  const loading = loadingItem || loadingProject;
  const error = errorItem || errorProject;
  const data = (!loadingItem && itemDataDoc)? itemDataDoc.data(): {};
  data.links = data.links || [];

  const projectData = (!loadingProject && projectDataDoc)? projectDataDoc.data(): {};

  useEffect(()=>{
    const storageRef = firebase.storage().ref();

    const projectRef = firebase.firestore().doc(`applications/${project_id}`);
    projectRef.get().then(p=>{
      if(!p.exists) throw new Error("Project doesn't exist");
      const data = p.data();
      if(!data.repo) return storageRef.child(project_id).listAll()
      else return firebase.storage().refFromURL(data.repo).listAll()
    })
    .then(files=>{
      const videos = [];
      const images = [];
      const items = files.items.map(item => {return {
        deleted: item.authWrapper.deleted, 
        path: `gs://${item.location.bucket}/${item.location.path}`,
        name: item.location.path,
      }});

      for (let item of items){
        if(item.deleted) continue;
        if(/.*\.mp4$/i.test(item.path)){
          videos.push(item);
        }else if(/.*\.(?:png|jpg)$/i.test(item.path)) {
          images.push(item);
        }
      }
      setMedias({images, videos, loaded: true});
    }).catch(e=>console.error(e))
  },[firebase, project_id]);



  function handleAddLink(name){
    const links = [{name, x:0, y:0, color:"#000000"}];
    if(Array.isArray(data.links)){
      links.unshift( ...data.links);
    }

    console.log("Add links : ", links);
    setSubmit(true);
    itemRef.set({links}, {merge: true})
    .catch(e=>alert(e))
    .then(()=>setSubmit(false));
  }

  function handleRemoveLink(index){
    const link = data.links[index];
    if(window.confirm(`Supprimer le lien vers ${link.name}?`)){
      const links = [].concat(data.links);
      links.splice(index,1);
      itemRef.set({links}, {merge: true})
      .catch(e=>alert(e));
    }
  }
  function onChange(e){
    e.preventDefault();
    const target = e.target;
    return handleChange(target.name, target.value)
  }

  function handleChange(name, value){
    let obj = {};
    const m = /^link_(\d+)_(\w+)/.exec(name)
    if(m){
      obj.links = [].concat(data.links);
      obj.links[m[1]][m[2]] = value;
    }else{
      obj = Object.assign({[name]:value});
    }
    //console.info("Submit changes : ", obj);
    //*
    setSubmit(true);
    itemRef.set(obj, {merge: true})
    .catch(e=>alert(e))
    .then(()=>setSubmit(false));
    //*/
  }
  let screen = null;
  if(loading){
    screen = null;
  }else if (!projectData.layout || projectData.layout.toLowerCase() == "wiki"){
    screen = (<WikiLayout data={data} handleChange={handleChange}/>)
  }else if(projectData.layout.toLowerCase() == "qa"){
    screen= (<QALayout data={data} handleChange={handleChange}/>)
  }else{
    console.error("Invalid data layout : ", data.layout)
  }

  return(<div className="p-4">
    {error && <ErrorMessage message={error.toString()}/>}
    {(loading || !medias.loaded ) && <Loader/>}
    {data && medias.loaded && <form className="base  d-flex flex-wrap justify-content-between" style={{position:"relative"}} onSubmit={(e)=> e.preventDefault()}>
      <div className="pr-3 flex-grow-1" style={{minWidth:400}}>
        {submitting && <div className="spinner-border pl-2" style={{position:"fixed", bottom:60, left:10, opacity:0.8}} role="status"><span className="sr-only">Loading...</span></div>}
        
        <fieldset disabled={false}>
          <FormSelector onChange={onChange} name="image" title="Image" value={data.image} items={medias.images}/>
          <FormSelector onChange={onChange} name="thumb" title="Miniature" value={data.thumb} items={medias.images}/>
          <FormSelector onChange={onChange} name="video" value={data.video} items={medias.videos}/>
          {Array.isArray(projectData.categories) && ( <FormSelector onChange={onChange} name="category" value={data.category} items={projectData.categories}/>)}

          <h3>Liens </h3>
          <div className="form-group pl-3">
            {0 < data.links.length && data.links.map((link, index)=>{
              return(<div className="form-group" key={index}>
                <div className="input-group mb-2">
                  <div className="input-group-prepend">
                    <button className="btn btn-outline-secondary" type="button" onClick={()=>handleRemoveLink(index)}><Octicon icon={Trashcan}/></button>
                  </div>
                  <input disabled readOnly type="text"  className="form-control" value={link.name}/>
                  <div className="input-group-append">
                    <Link to={`/projects/${project_id}/${link.name}`} className="btn btn-outline-primary text-primary">Voir</Link>
                  </div>
                </div>
                
                <div className="form-group pl-3">
                  <TitleFormInput onChange={onChange} name={`link_${index}_title`} title="Titre" placeholder="nom du lien (par défaut)" value={link.title} />
                  <TitleFormInput onChange={onChange} name={`link_${index}_x`} title="x" type="number"   value={link.x}/>
                  <TitleFormInput onChange={onChange} name={`link_${index}_y`} title="y" type="number"   value={link.y}/>
                  <TitleFormInput onChange={onChange} name={`link_${index}_color`} title="color" type="text" value={link.color}/>
                </div>
              </div>)
            })}


            {(!data.links || 0 == data.links.length) && <small className="form-text text-dark text-right">Aucun lien actif sur cet objet</small>}
            <div className="form-group">
              <h4>Ajouter un lien:</h4>
              <small id="passwordHelpBlock" className="form-text text-muted">
                Remplir ce champ et sauvegarder pour ajouter un lien
              </small>
              <div className="col-sm-10">
                <AddLink handleSubmit={handleAddLink}/>
              </div>
            </div>
          </div>
        </fieldset>
      </div> 
      <div >
        {screen}
      </div>
    </form>}
  </div>)
}

Item.propTypes = {
  match : PropTypes.shape({params:PropTypes.shape({
    project: PropTypes.string.isRequired,
    item: PropTypes.string.isRequired,
  }).isRequired}).isRequired,
}