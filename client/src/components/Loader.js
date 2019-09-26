import React from "react";

export default function Loader(){
  return (<div className="d-flex w-100 justify-content-center pt-4">
  <div className="spinner-border" style={{width: "3rem", height: "3rem"}} role="status">
    <span className="sr-only">Loading...</span>
  </div>
</div>)
}