import React from "react";

export default function ErrorMessage(props){
  console.warn("Made error message for : ", props);
  return (<div className="jumbotron">
    <h1 className="display-4">Error!</h1>
    <p className="lead">{props.message}</p>
    {props.stack && <code><pre>{props.stack}</pre></code>}
  </div>)
}