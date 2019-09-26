import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
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

const firebaseAppAuth = firebaseApp.auth();const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
};

function App(props) {
  const {
    user,
    signOut,
    signInWithGoogle,
  } = props;
  //console.warn("User : ", user);
  if(!user){
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>Please sign in.</p>
          <button onClick={signInWithGoogle}>Sign in with Google</button>
        </header>
      </div>
    );
  }else{
    return(<FirebaseContext.Provider value={firebaseApp}>
      <Router>
        <div className="wrapper">
          <nav className="navbar">
          <button onClick={signOut}>Sign out</button>
          <li>
              <Link to="/">Home</Link>
          </li>
          </nav>
          <div className="content">
          <Route path="/" exact component={Projects} />
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
