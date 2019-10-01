import React from 'react';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";

import 'bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';

import logo from './logo.svg';
import './App.css';

import Projects from "./components/Projects";
import Project from "./components/Project";
import Item from "./components/Item";

import withFirebaseAuth from 'react-with-firebase-auth'
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import firebaseConfig from './firebaseConfig';
import FirebaseContext from "./context";

const firebaseApp = firebase.initializeApp(firebaseConfig);

const firebaseAppAuth = firebaseApp.auth();
const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
  signInWithEmailAndPassword: new firebase.auth.EmailAuthProvider(),
};


function App(props) {
  const {
    user,
    signOut,  
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithGoogle,
  } = props;
  //console.warn("User : ", user);
  if(!user){
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>Veuillez vous authentifier</p>
          <div class="btn-group" role="group" aria-label="...">
            <button className="btn btn-outline-primary" onClick={signInWithGoogle}>Email google</button>
            <button className="btn btn-outline-primary" onClick={signInWithEmailAndPassword}>Authentification</button>
            <button className="btn btn-outline-primary" onClick={createUserWithEmailAndPassword}>Créer un compte</button>
          </div>
        </header>
      </div>
    );
  }else{
    return(<FirebaseContext.Provider value={firebaseApp}>
      <Router>
        <div className="wrapper">
          <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <Route path="/projects/:project" render={props => {
              return (<li><Link className={`nav-link${props.match.isExact?" active":""}`} to={props.match.url}>&gt; {props.match.params.project}</Link></li>)
            }}/>
            <Route path="/projects/:project/:item" render={props => {
              return (<li><span className="nav-link active">&gt; {props.match.params.item}</span></li>)
            }}/>
          </ul>
          <button onClick={signOut} className="nav-link btn btn-outline-secondary text-light" to="/">Sign out</button>
          </nav>
          <div className="content">
            <Route path="/" exact render={(routeProps)=> <Projects user={user} {...routeProps}/>} />
            <Route path="/projects/:project" exact component={Project} />
            <Route path="/projects/:project/:item" exact component={Item} />
          </div>
        </div>
      </Router>
    </FirebaseContext.Provider>)
  }
  
}

export default withFirebaseAuth({
  providers,
  firebaseAppAuth,
})(App);
