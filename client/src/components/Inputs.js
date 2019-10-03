import React, {useState} from "react";

import ReactMde from "react-mde";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});

export function MarkdownInput(props){
  const [value, setValue] = useState(props.value);
  const [selectedTab, setSelectedTab]= useState("write");
  console.info("Render markdown with : ", props.value);
  return (<div className="form-group">
  <label htmlFor={props.name} >{props.title? props.title : props.name}</label>
  <ReactMde
    name={props.name}
    value={value}
    onChange={(val)=>{
      setValue(val);
      props.handleChange(props.name, val)
    }}
    selectedTab={selectedTab}
    onTabChange={setSelectedTab}
    generateMarkdownPreview={markdown =>
      Promise.resolve(converter.makeHtml(markdown))
    }
  />
</div>)
}


export function FormInput(props){
  return(<div className="form-group row">
    <label htmlFor={props.name} className="col-sm-2 col-form-label">{props.title? props.title : props.name} : </label>
    <div className="col-sm-10">
      <input className="form-control" type={props.type? props.type : "text"} name={props.name} value={props.value||""} onChange={props.onChange}></input>
    </div>
  </div>)
}

export function FormTextArea(props){
  return(<div className="form-group">
    <label htmlFor={props.name} >{props.title? props.title : props.name}</label>
    <textarea type="text" className="form-control" name={props.name} rows="4" value={props.value} onChange={props.onChange} placeholder={props.placeholder || "..."}></textarea>
  </div>)
}

export function FormSelector(props){
  return(<div className="form-group">
    <label htmlFor={props.name} className="col-sm-2 col-form-label" >{props.title? props.title : props.name}</label>
    <select name={props.name} className="col-sm-10 form-control custom-select" value={props.value} onChange={props.onChange}>
      <option key="0" value="">Vide</option>
      {props.items.map(item=> <option key={item.path} value={item.path}>{item.name}</option>)}
    </select>
  </div>)
}

export function TitleFormInput(props){
  return(<div className="input-group mb-3">
    <div className="input-group-prepend">
      <span className="input-group-text" style={{minWidth:60, textAlign: "right"}}id={props.name}>{props.title? props.title : props.name}</span>
    </div>
    <input type={props.type? props.type : "text"} name={props.name} className="form-control" aria-label="Sizing example input" aria-describedby={props.name} value={props.value} onChange={props.onChange} />
  </div>)
}

export function AddLink(props){
  const [name, setName] = useState("");

  return <div className="input-group">
    <div className="input-group-prepend">
      <span className="input-group-text" id="add_link">Ajouter</span>
    </div>
    <input type={props.type? props.type : "text"} name="linkadd_name" className="form-control" aria-label="Sizing example input" aria-describedby="add_link" value={name} onChange={(e)=>setName(e.target.value)} />
    <div className="input-group-append">
      <button className="btn btn-outline-secondary" onClick={()=>{props.handleSubmit(name);setName("")}}>Send</button>
    </div>
  </div>
}