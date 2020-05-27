
import "@react-native-firebase/firestore";
import firebase from "@react-native-firebase/app";

import {makeLocal} from "./makeLocal";

import {CacheStage} from "./cache";

export function watchFiles({
  projectName,
  dispatch,
  onProgress = function () { },
  onUpdate = function () { },
} = {}) {
  if (!projectName) {
    throw new Error(`A valid projectName is required. Got ${projectName}`);
  }


  let unsubscribes = [];
  let abortConfig, abortProject;

  const db = firebase.app().firestore();

  const projectRef = db.collection("applications").doc(projectName);
  const collectionsRef = projectRef.collection("pages");


  unsubscribes.push(projectRef.onSnapshot(
    (configSnapshot) => {
      if (abortConfig) abortConfig.abort(); //Cancel any previous run
      abortConfig = new AbortController();
      onUpdate("config");
      onConfigSnapshot(configSnapshot, { signal: abortConfig.signal, onProgress, projectRef, dispatch })

    },
    (e) => onProgress("Can't get project snapshot for " + projectRef.path + " :", e.message)
  ))

  unsubscribes.push(collectionsRef.onSnapshot(
    (projectSnapshot) => {
      if (abortProject) abortProject.abort();
      abortProject = new AbortController();
      onUpdate("items");
      onProjectSnapshot(projectSnapshot, { signal: abortProject.signal, onProgress, projectRef, dispatch });
    },
    (e) => onProgress("Can't get collections snapshot for " + collectionsRef.path + " :", e.message)
  ));
  return () => {
    unsubscribes.forEach(fn => fn());
    
  }
}


async function onConfigSnapshot(configSnapshot, { signal, onProgress, projectRef, dispatch }) {
  let errors = [];
  let cache = new CacheStage("config");
  const categoriesRef = projectRef.collection("categories");
  if (!configSnapshot.exists) {
    console.warn("Application has no configuration set. Using defaults.");
  }
  const config = configSnapshot.exists ? configSnapshot.data() : {};
  try {
    const [errors, new_files ] = await makeLocal(config);
    if(errors.length != 0){
      onProgress(`${errors.length} errors while downloading files for project configuration`);
    }
    cache.batch(new_files);
  } catch (e) {
    return onProgress("Failed to fetch config resources : ", e);
  }
  if (signal && signal.aborted) return //Don't do nothing on abort
  let categories = [];
  try {
    const categoriesSnapshot = await categoriesRef.get();
    categories = categoriesSnapshot.docs;
  } catch (e) {
    //Ignore becasue it's sometimes OK to not have a categories collection
    //onProgress("Failed to get categories snapshot", e);
  }
  config.categories = (Array.isArray(config.categories)) ? config.categories.map(c => {
    return (typeof c === "string") ? { name: c } : c;
  }) : [];
  for (let category of categories) {
    const c = category.data();
    const [new_errors, new_files] = await makeLocal(c);
    if (signal && signal.aborted) return;
    errors = errors.concat(new_errors);
    cache.batch(new_files);
    config.categories.push(c);
  }
  if (errors.length !== 0) {
    onProgress(`${errors.length} errors while downloading files`);
  }
  if (signal && signal.aborted) return;
  await cache.close()
  .catch((e)=>{
    onProgress(`Failed to save cache file : ${e.message}`);
  })

  dispatch({ config });
  onProgress("Updated configuration");
}

async function onProjectSnapshot(projectsSnapshot, { signal, onProgress, projectRef, dispatch }) {
  const items = {};
  let cache = new CacheStage("items");
  const projects = projectsSnapshot.docs;
  if (projects.length == 0) {
    throw new Error(`no project found in ${projectRef.id}`);
  }
  for (let s of projects) {
    const d = s.data();
    if (d.active === false) continue;
    items[s.id] = d;
    const [errors, new_files] = await makeLocal(d);
    await cache.batch(new_files);
    if (signal && signal.aborted) return;
    for (let error of errors){
      onProgress(`Download failed : ${error.message}`);
    }
  }

  await cache.close()
  .catch((e)=>{
    onProgress(`Failed to save cache file : ${e.message}`);
  })

  dispatch({ items });
  onProgress("Updated item collections");
}
