import fs from "filesystem";
import {EventEmitter} from "events";
import {firebase} from "firebase";
import {makeLocal} from "./makeLocal";

import {CacheStage, getCachedHash} from "./cache";
import writeToFile from "writeToFile";


export async function transformSnapshot(transforms, snapshot){
  let res = Object.assign(snapshot.exists? snapshot.data(): {}, {id: snapshot.id});
  let files = new Map();
  for(let t of transforms){
    let [tr_res, new_files ] = await t(res);
    res = tr_res;
    files = new Map([...files, ...new_files]);
  }
  return [res, files];
}


export class WatchFiles extends EventEmitter{
  constructor({projectName, transforms=[makeLocal], idleTimeout}){
    super();
    this.projectName = projectName;
    this.transforms = transforms;
    this.idleTimeout = idleTimeout;
    this.idleInterval = null;
    this.on("progress", ()=>{
      if(this.idleInterval) this.idleInterval.refresh();
    })
    this.unsubscribes = [];
  }
  get isConnected(){
    return 0 < this.unsubscribes.length;
  }
  watch(){
    if(this.isConnected){
      console.warn("WatchFiles.watch() called while subscriptions are still active. This is probably a memory leak");
    }
    const db = firebase.app().firestore();
    const projectRef = db.collection("applications").doc(this.projectName);
    const collectionsRef = projectRef.collection("pages");
    let aborts = {};
    this.unsubscribes.push(projectRef.onSnapshot(
      (configSnapshot) => {
        if (aborts.config) aborts.config.abort(); //Cancel any previous run
        aborts.config = new AbortController();
        this.onConfigSnapshot(configSnapshot, {signal: aborts.config.signal})
      },
      (e) => this.makeError("configSnapshot", e)
    ));

    this.unsubscribes.push(collectionsRef.onSnapshot(
      (projectsSnapshot) => {
        if (aborts.items) aborts.items.abort();
        aborts.items = new AbortController();
        this.onProjectsSnapshot(projectsSnapshot, {signal: aborts.items.signal})
      },
      (e) => this.makeError("projectsSnapshot", e)
    ));

    this.unsubscribes.push(()=>{
      Object.keys(aborts).forEach((key)=>{
        aborts[key].abort();
      })
    })

    if(typeof this.idleTimeout === "number" && 0 < this.idleTimeout){
      this.idleInterval = setInterval(()=>{
        this.close();
      }, this.idleTimeout);
      //In a browser, idleInterval is just a number while in nodejs it's a Timeout object
      if(typeof this.idleInterval.unref === "function") this.idleInterval.unref();
      this.unsubscribes.push(()=>{
        clearInterval(this.idleInterval)
        this.idleInterval = null;
      });
    }
  }

  makeError(name, orig){
    let e = new Error(`${name} failed : ${orig.message}`);
    e.name = orig.name;
    e.stack = orig.stack;
    e.code = orig.code;
    this.emit("error", e);
  }

  onConfigSnapshot(configSnapshot, {signal}={}){
    this.emit("start", "config");
    transformSnapshot(this.transforms, configSnapshot)
    .then(async ([config, files])=>{
      try {
        await this.getFiles({files, signal, cacheName: "config"});
      } catch(e){
        this.makeError("getFiles", e);
      }
      if (signal && signal.aborted){
        this.emit("progress", "Aborted update");
        return 
      }
      if((Array.isArray(config.categories)) ){
        config.categories = config.categories.map(c => {
          return (typeof c === "string") ? { name: c } : c;
        });
      }
      
      this.emit("dispatch", { config });
    })
    .catch((e)=>{
      this.makeError("data.config", e);
    });
  }

  onProjectsSnapshot(projectsSnapshot, {signal}={}){
    this.emit("start", "items");
    Promise.all(projectsSnapshot.docs.map(p => transformSnapshot(this.transforms, p)))
    .then(async (projects)=>{
      let items = {};
      let files = projects.reduce((prev, [, files])=> {
        return new Map([...prev, ...files])
      }, new Map());
      try {
        await this.getFiles({files, signal, cacheName: "items"});
      } catch(e){
        this.makeError("getFiles", e);
      }
      if (signal && signal.aborted){
        this.emit("progress", "Aborted update");
        return;
      }

      for (let [d] of projects) {
        if (d.active === false) continue;
        items[d.id] = d;
      }
      this.emit("dispatch", { items });
    })
    .catch((e)=>{
      this.makeError("data.items", e);
    });
  }

  async getFiles({cacheName, files, signal}){
    let cache = new CacheStage(cacheName);
    let requiredFiles = [];
    let cachedFiles = [];
    try{
      for (let [dest, {src, hash}={}] of files){
        const name = dest.split("/").slice(-1)[0];
        const [localExists, localHash] = await Promise.all([
          fs.exists(dest),
          getCachedHash(dest)
        ]);
        if(!(localExists && localHash && localHash === hash)){
          if(!localExists) console.info(`${dest} doesn't exists`);
          else if(!localHash) console.info(`no cached hash for ${dest}`)
          else console.info(`local hash for ${name} is ${localHash}. remote is ${hash}`);
          requiredFiles.push({src, dest, hash});
        }else{
          cachedFiles.push({src, dest, hash});
          //console.info(`cache for ${name} is up to date`);
        }
        cache.batch(cachedFiles.reduce((res, {dest, hash})=> Object.assign(res, {[dest]: hash}), {}));    
      }  
    }catch(e) {
      //Errors during cache analysis are fatal
      return (signal && signal.aborted)? Promise.resolve(): cache.close()
      .finally(()=>{
        this.makeError("compare cache", e);
      });
    }

    for(let index=0; index < requiredFiles.length; index++){
      let {src, dest, hash} = requiredFiles[index];
      this.emit("progress", `GET ${src.split("/").slice(-1)[0]} (${index+1}/${requiredFiles.length})`);
      try{
        await writeToFile(src, dest);
        cache.set(dest, hash);
      }catch(e){
        this.makeError("download file" + e.message);
      }
      if (signal && signal.aborted) return;
    }

    await cache.close().catch((e)=>{
      this.makeError("save cache", e);
    });
  }

  
  close(){
    this.unsubscribes.forEach(fn => fn());
    this.unsubscribes = [];
  }
}
