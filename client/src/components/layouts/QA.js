'use strict';
import React from "react";
import PropTypes from 'prop-types';

import StorageImage from "../StorageImage";
import BackgroundImage from "../BackgroundImage";


import {FormTextArea, TitleFormInput, MarkdownInput, FormInput} from "../Inputs";

export default function QALayout({data, handleChange}){
  function onChange(e){
    e.preventDefault();
    const target = e.target;
    return handleChange(target.name, target.value)
  }
  let links;
  if(data.links && 0 < data.links.length){
    links = data.links.map((link, index)=>{
      return (<li className={`list-group-item ${index%2 == 0 ? "text-light bg-primary": "bg-light text-primary"}`}>{link.title||link.name}</li>)
    })
  }else{
    links=(<div>
      <span className="text-muted">Pas de lien : Page de réponse</span>
      <FormInput type="number" title="durée (s)" name="duration" value={data.duration} onChange={onChange}/>
    </div>)
  }
  
  return (<div className="ipad-screen-outline">
  <div className="d-flex flex-column align-content-stretch" style={{height:"100%"}}>
    <div className="">
      <div className="ipad-screen-title">
        <TitleFormInput onChange={onChange} name="title" title="Titre" value={data.title}/>
      </div>
      <div className="ipad-screen-subtitle">
        <TitleFormInput onChange={onChange} name="subtitle" title="Sous-Titre" value={data.subtitle}/>
      </div>
    </div>
    <div className="grow-1">
      <ul className="list-group list-group-flush">
        {links}
      </ul>
    </div>
  </div>
 
</div>)
}

QALayout.propTypes = {
  handleChange: PropTypes.func.isRequired,
  data: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    abstract: PropTypes.string,
    mainText: PropTypes.string,
    image: PropTypes.string,
    thumb: PropTypes.string,

  }).isRequired,
}