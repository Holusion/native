import React, {useContext, useState} from "react";
import { Link } from "react-router-dom";

import { useDocument } from 'react-firebase-hooks/firestore';

import FirebaseContext from "../context";

import BackgroundImage from "./BackgroundImage";

function FormItem(props){
  return(<div className="form-group row">
    <label htmlFor={props.name} className="col-sm-2 col-form-label">{props.title? props.title : props.name} : </label>
    <div className="col-sm-10">
      <input className="form-control" type={props.type? props.type : "text"} name={props.name} defaultValue={props.value}></input>
    </div>
  </div>)
}

function TitleFormItem(props){
  return(<div className="input-group mb-3">
  <div className="input-group-prepend">
    <span className="input-group-text" id={props.name}>{props.title? props.title : props.name}</span>
  </div>
  <input type={props.type? props.type : "text"} name={props.name} className="form-control" aria-label="Sizing example input" aria-describedby={props.name} defaultValue={props.value} />
  </div>)
}

export default function Item(props){
  const project_id = props.match.params.project;
  const item_id = props.match.params.item;
  const firebase = useContext(FirebaseContext);
  const ref = firebase.firestore().doc(`applications/${project_id}/projects/${item_id}`);
  const [value, loading, error] = useDocument(
    ref
  );
  const data = (value)? value.data(): {};
  if(value)  console.log("Value : ", value.data());
  function handleChange(e){
    e.preventDefault();
    const form = e.target;
    const obj = {links:[]};
    ["image", "title", "description"].forEach(function(key){
      console.log("Checking key : ", key, form[key]);
      if(form[key].value){
        obj[key] = form[key].value;
      }
    })
    for(let index=0; index < data.links.length; index++){
      console.log(`"link_${index}_name" : `, form["link_0_name"]);
      if(!form[`link_${index}_name`].value) continue;
      console.log(`Check for :  "link_${index}_name" : `, form[`link_${index}_name`].value)
      obj.links.push({
        name: form[`link_${index}_name`].value,
        x: form[`link_${index}_x`].value,
        y: form[`link_${index}_y`].value,
        color: form[`link_${index}_color`].value,
      })
    }
    if(form[`linkadd_name`].value){
      obj.links.push({
        name: form[`linkadd_name`].value,
        x: form[`linkadd_x`].value,
        y: form[`linkadd_y`].value,
        color: form[`linkadd_color`].value,
      })
    }
    console.info("Set document to : ", obj);
    ref.set(obj);
  }

  return(<div className="base">
    {error && <strong>Error: {JSON.stringify(error)}</strong>}
    {loading && <span>Collection: Loading...</span>}
    {data && <React.Fragment>
      <form className="conf px-4" onSubmit={handleChange}>
        <FormItem name="image" value={data.image}/>
        <h3>Description longue :</h3>
        <div className="form-group px-3">
          <FormItem name="title" value={data.title}/>
          <small id="passwordHelpBlock" className="form-text text-muted">
            Si la description est vide, l'image s'affichera en pleine largeur
          </small>
          <FormItem name="description" value={data.description}/>
        </div>
        <h3>Liens </h3>
          <small id="passwordHelpBlock" className="form-text text-muted">
            Pour supprimer un lien, vider son nom et sauvegarder
          </small>
        <div className="form-group px-3">
          {(data.links || []).map((link, index)=>{
            return(<div className="form-group" key={index}>
              <div className="row">
                <div className="col-sm-10">
                  <TitleFormItem name={`link_${index}_name`} title="Bât" value={link.name} />
                </div>
                <div className="col-sm-2">
                  <Link to={`/projects/${project_id}/${link.name}`}>Voir</Link>
                </div>
              </div>
              
              <div className="form-group px-3">
                <FormItem name={`link_${index}_x`} title="x" type="number"   value={link.x}/>
                <FormItem name={`link_${index}_y`} title="y" type="number"   value={link.y}/>
                <FormItem name={`link_${index}_color`} title="color" type="text" value={link.color}/>
              </div>
            </div>)
          })}
          <div className="form-group">
            <h4>Ajouter un lien:</h4>
            <small id="passwordHelpBlock" className="form-text text-muted">
              Remplir les champs suivants et sauvegarder pour ajouter un lien
            </small>
            <div className="col-sm-10">
              <TitleFormItem name={`linkadd_name`} title="Bât" value="" />
            </div>
            
            <div className="form-group px-3">
                <FormItem name={`linkadd_x`} title="x" type="number"   value={0}/>
                <FormItem name={`linkadd_y`} title="y" type="number"   value={0}/>
                <FormItem name={`linkadd_color`} title="color" type="text" value=""/>
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">SUBMIT</button>
      </form>
      <div className="screen">
        <div className="ipad-screen-outline">
          {data.image && <BackgroundImage source={data.image}/>}
        </div>
      </div>
    </React.Fragment>}
  </div>)
}