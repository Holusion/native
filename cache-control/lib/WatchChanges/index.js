import fs from "filesystem";
import {EventEmitter} from "events";
import {firebase} from "firebase";
import AsyncLock from 'async-lock';

import {defaultTransformsFactory} from "../transforms";

export {transformSnapshot} from "./transformSnapshot";
import {transformSnapshot} from "./transformSnapshot";
/**
 * @typedef FileRef
 * @property {string} hash
 * @property {string} src
 * @property {string} dest
 * @property {string} contentType]
 * @property {number} size
 */

/**
 * @event WatchChanges#start
 * @type {string="config","items"} - Indicates which listener has fired
 */

/**
 * @event WatchChanges#progress
 * @type {object}
 * @property {number} totalSize - total size of sync to dowload
 * @property {number} requiredSize - size of required files
 * @property {number} progress - number of bytes downloaded
 * @property {number} length - total number of files (cache + downloads)
 * @property {number} nbDone   - number of files already fetched
 * @property {boolean} blocking - whether required files are missing
 */

/**
 * @event WatchChanges#dispatch
 * @type {object}
 * @property {object} [config] - a new config to dispatch
 * @property {object} [items] - new items to dispatch
 * @property {Array<FileRef>} [files] - required files for this data
 */


/**
 * Receive and transform Firestore documents updates
 * "progress" is guaranteed to happen before "dispatch"
 * It is a good idea for the consumer  to block render of dispatched data until progress.blocking === false
 * @fires WatchChanges#start
 * @fires WatchChanges#dispatch
 * @fires WatchChanges#progress
 */
export class WatchChanges extends EventEmitter{
  /**
   * @param {object} param0
   * @param {string} param0.projectName - the application to bind to
   * @param {function[]} [param0.transforms] - an array of transforms to make over incoming data
   */
  constructor({projectName, transforms=defaultTransformsFactory(projectName)}){
    super();
    this.projectName = projectName;
    this.transforms = transforms;

    this.lock = new AsyncLock({ });


    this.unsubscribes = [];
  }
  get isConnected(){
    return 0 < this.unsubscribes.length;
  }

  watch(){
    if(this.isConnected){
      console.warn("WatchChanges.watch() called while subscriptions are still active. This is probably a memory leak");
    }
    const db = firebase.app().firestore();
    const projectRef = db.collection("applications").doc(this.projectName);
    const collectionsRef = projectRef.collection("pages");

    //Create separate AbortController for each listener
    //So they can abort individually and be all cancelled on close()
    let aborts = {};
    function withSignal(name, callback){
      if(aborts[name]) aborts[name].abort();
      aborts[name] = new AbortController();
      callback(aborts[name].signal)
    }

    // Listen for projects Snapshots
    this.unsubscribes.push(projectRef.onSnapshot(
      (configSnapshot) => withSignal("config", (signal)=>{
        this.onConfigSnapshot(configSnapshot, {signal})
      }),
      (e) => this.makeError("configSnapshot", e)
    ));

    // Listen for pages Snapshots
    this.unsubscribes.push(collectionsRef.onSnapshot(
      (projectsSnapshot) => withSignal("items", (signal)=>{
        this.onProjectsSnapshot(projectsSnapshot, {signal})
      }),
      (e) => this.makeError("projectsSnapshot", e)
    ));

    // Cancel all AbortController on close
    this.unsubscribes.push(()=>{
      Object.keys(aborts).forEach((key)=>{
        aborts[key].abort();
      })
    })
  }

  makeError(name, orig){
    /* istanbul ignore next */
    let e = new Error(`${name} failed : ${orig?orig.message: new Error("Original Error not provided")}`);
    e.name = orig.name;
    e.stack = orig.stack;
    e.code = orig.code;
    this.emit("error", e);
  }

  onConfigSnapshot(configSnapshot, {signal}={}){
    this.emit("start", "config");
    transformSnapshot(this.transforms, configSnapshot)
    .then(async ([config, files])=>{
      //await this.handleFiles({files, name: "items", signal});
      if (signal && signal.aborted) return;
      this.emit("dispatch", { config, files } );
    }, (e)=>{
      this.makeError("data.config", e);
    });
  }

  onProjectsSnapshot(projectsSnapshot, {signal}={}){
    this.emit("start", "items");
    let activeDocs = projectsSnapshot.docs.filter((doc)=>{
      return doc.data().active !== false
    })
    Promise.all(activeDocs.map(p => transformSnapshot(this.transforms, p)))
    .then(async (projects)=>{

      let items = {};
      let files = projects.reduce((prev, [d, files])=> {
        return new Map([...prev, ...files])
      }, new Map());
      
      for (let [d] of projects) {
        items[d.id] = d;
      }
      //await this.handleFiles({files, name: "items", signal});

      if (signal && signal.aborted) return;
      this.emit("dispatch", { items, files });
    }, (e)=>{
      this.makeError("data.items", e);
    });
  }
  
  close(){
    this.unsubscribes.forEach(fn => fn());
    this.unsubscribes = [];
  }
}
