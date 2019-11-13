'use strict';
import React from "react";
import PropTypes from 'prop-types';

import StorageImage from "../StorageImage";
import BackgroundImage from "../BackgroundImage";


import {FormTextArea, TitleFormInput, MarkdownInput} from "../Inputs";

export default function WikiLayout({data, handleChange}){
  function onChange(e){
    e.preventDefault();
    const target = e.target;
    return handleChange(target.name, target.value)
  }

  return (<div className="ipad-screen-outline">
  <div className="d-flex align-content-stretch" style={{height:"100%"}}>
    <div style={{width:"66%", position:"relative", zIndex: 1, overflow: "auto"}}>
      {data.image &&  <div style={{width:"100%",height:"var(--ipad-height)", position:"absolute", zIndex: -1, overflow:"auto"}}>
        {data.image && <BackgroundImage source={data.image}/>}
        <div style={{position:"absolute", bottom:0}}>
          <small id="passwordHelpBlock" className="form-text text-muted">
            Enlever l'image pour définir une description longue
          </small>
        </div>
      </div>}
      <div>
        <div className="ipad-screen-title">
        <TitleFormInput onChange={onChange} name="title" title="Titre" value={data.title}/>
        </div>
        <div className="ipad-screen-subtitle">
          <TitleFormInput onChange={onChange} name="subtitle" title="Sous-Titre" value={data.subtitle}/>
        </div>
        {data.image || <FormTextArea onChange={onChange} name="abstract" title="Abstract" value={data.abstract} placeholder="pas d'abstract"/>}
      </div>
      {data.image ||<div style={{}}>
        <div style={{}}>
          <MarkdownInput handleChange={handleChange} name="mainText" title="Cartouche" value={data.mainText} placeholder="Pas de texte"/>
          <small id="passwordHelpBlock" className="form-text text-muted">
            Description au format <a target="_blank" rel="noopener noreferrer" href="https://www.markdownguide.org/basic-syntax/">&lt;markdown&gt;</a>
          </small>
        </div>
      </div>}
     
    </div>
    <div style={{width:"34%", background:"#cccccc", position:"relative", zIndex: 1, overflow:"auto"}} className="d-flex flex-column">
    {data.thumb && <StorageImage source={data.thumb}/>}
    <small id="passwordHelpBlock" className="form-text text-muted">
      Si la description est vide, l'image s'affichera en pleine largeur
    </small>
      <MarkdownInput handleChange={handleChange} name="description" title="Cartouche" value={data.description} placeholder="Pas de cartouche (image pleine page)"/>
      <small id="passwordHelpBlock" className="form-text text-muted">
        Description au format <a target="_blank" rel="noopener noreferrer" href="https://www.markdownguide.org/basic-syntax/">&lt;markdown&gt;</a>
      </small>
    </div>
  </div>
 
</div>)
}

WikiLayout.propTypes = {
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