import React, {useContext} from "react"
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import StorageImage from "./StorageImage";



const image_props ={
  className: "card-img-top img-fluid",
  style:{objectFit:"contain", height: 150},
}
export default function Card(props){
  let image;
  
  if(typeof props.image ==="object"){
    image = props.image;
  }else if (props.thumb){
    image = (<StorageImage source={props.thumb} {...image_props}/>)
  }else if(props.image){
    image = (<StorageImage source={props.image} {...image_props}/>)
  }else{
    image = (<img style={{objectFit:"contain"}} className="card-img-top" src="/logo192.png"/>)
  }
  return (<Link to={props.url}>
    <div className="card" style={{width: props.width||"auto"}}>
      {image}
      <div className="card-body  bg-primary text-white">
        <h5 className="card-title">{20 < props.title.length ? props.title.substring(0,20)+"...":props.title}</h5>
        <p className="card-text">
        </p>
      </div>
    </div>
  </Link>)
}

Card.propTypes = {
  image: PropTypes.string,
  title: PropTypes.string,
  url: PropTypes.string,
  width: PropTypes.any,
}
