import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";

import 'bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';

import logo from './logo.svg';
import './App.css';

import Projects from "./components/Projects";
import Project from "./components/Project";
import Item from "./components/Item";

import ErrorMessage from "./components/ErrorMessage";
import Loader from "./components/Loader";

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import firebaseConfig from './firebaseConfig';
import FirebaseContext from "./context";

import { useAuthState } from 'react-firebase-hooks/auth';


const firebaseApp = firebase.initializeApp(firebaseConfig);

const firebaseAppAuth = firebaseApp.auth();
const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
  emailAuthProvider: new firebase.auth.EmailAuthProvider(),
};

function signInWith(providerName){
  if(!providers[providerName]) throw new Error("No such provider : "+providerName);
  return firebaseAppAuth.signInWithPopup(providers[providerName]);
}

function signIn(e){
  e.preventDefault();
  const target = e.target;
  const username = target["email"].value;
  const password = target["password"].value;
  firebaseAppAuth.signInWithEmailAndPassword(username, password)
  .catch(e=>{
    if(e.code !== "auth/user-not-found"){
      return window.alert(e);
    }else if(window.confirm("L'utilisateur n'existe pas. Voulez-vous le créer?")){
      return firebaseAppAuth.createUserWithEmailAndPassword(username, password);
    }
  })
}

function signOut(){
  return firebaseAppAuth.signOut();
}

function NoMatch({location}){
  return(<div className="container">
    <ErrorMessage message={`la page demandée n'existe pas`} title="404 : page non trouvée" stack={`${location.pathname}`}/>
  </div>)
}

export default function App(props) {
  const [user, initialising, error] = useAuthState(firebase.auth());
  let children;
  if(initialising){
    children = (<Loader/>)
  }else if(error){
    children = (<ErrorMessage {...error}/>)
  }else if(!user){
    children = (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>Veuillez vous authentifier</p>
          <form onSubmit={signIn}>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="email-label" style={{width:40}}>@</span>
              </div>
              <input type="email" className="form-control" placeholder="email" aria-label="email" aria-describedby="email-label" name="email"/>
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="password-label" style={{width:40}}>#</span>
              </div>
              <input type="password" className="form-control" placeholder="password" aria-label="password" aria-describedby="password-label" name="password"/>
            </div>
            <div className="btn-group" role="group" aria-label="...">
              <button className="btn btn-outline-primary" type="button" onClick={(e)=>{e.preventDefault();signInWith("googleProvider")}}>Email google</button>
              <button className="btn btn-outline-primary" type="submit">Login</button>
            </div>
          </form>
        </header>
      </div>
    );
  }else{
    children = (<main>
      <Switch>
        <Route path="/" exact render={(routeProps)=> <Projects user={user} {...routeProps}/>} />
        <Route path="/projects/:project" exact component={Project} />
        <Route path="/projects/:project/:item" exact component={Item} />
        <Route component={NoMatch} />
      </Switch>
    </main>)
  }
  return (<FirebaseContext.Provider value={firebaseApp}>
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
        {children}
      </div>
    </Router>
  </FirebaseContext.Provider>)
}

