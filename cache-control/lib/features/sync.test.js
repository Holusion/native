
import {testSaga} from "redux-saga-test-plan";
import { getConf } from "./conf";
import { getConfig, getItemsArray } from "./data";
import { getHash, getUncachedFiles } from "./files";
import { getActiveProduct } from "./products";
import { setSynchronized, SET_SYNCHRONIZED } from "./status";
import {synchronizeProduct, abortableFetch, newSet, getFilenames, abortableUpload} from "./sync";


describe("synchronizeProduct", ()=>{

  test("abort if target is not set", ()=>{
    testSaga(synchronizeProduct).next()
    .put(setSynchronized(false)).next()
    .select(getActiveProduct).next(undefined)
    .select(getUncachedFiles).next()
    .isDone();
  })

  test("abort if files are not synchronized", ()=>{
    testSaga(synchronizeProduct).next()
    .put(setSynchronized(false)).next()
    .select(getActiveProduct).next({name: "iris32-21", url: "192.168.1.4"})
    .select(getUncachedFiles).next(["foo.png", "bar.mp4"])
    .isDone();
  })

  test("uses the list of required files", ()=>{
    testSaga(synchronizeProduct).next()
    .put(setSynchronized(false)).next()
    .select(getActiveProduct).next({name: "iris32-21", url: "192.168.1.4"})
    .select(getUncachedFiles).next([])
    .select(getConf).next({})
    .select(getItemsArray).next([{id: "foo", video: "file:///applications/app/foo.mp4"}])
    .select(getConfig).next({
      video:"file:///applications/app/bar.mp4", 
      categories:[{video: "file:///applications/app/baz.mp4"}]
    })
    .call(newSet, [
      "file:///applications/app/foo.mp4",
      "file:///applications/app/bar.mp4",
      "file:///applications/app/baz.mp4",
    ]).next(new Set())
    .finish();
  })

  test("handle playlist fetch error", ()=>{
    let res = {
      ok: false,
      json: ()=>({message: "Internal Error", code: 500})
    }
    let wrap = new Error(`Echec de la récupération de la playlist`);
    
    testSaga(synchronizeProduct).next()
    .put(setSynchronized(false)).next()
    .select(getActiveProduct).next({name: "iris32-21", url: "192.168.1.4"})
    .select(getUncachedFiles).next([])
    .select(getConf).next({})
    .select(getItemsArray).next([])
    .select(getConfig).next({})
    .call(newSet, []).next(new Set())
    .call(abortableFetch, 'http://192.168.1.4/playlist', { method: 'GET' }).next(res)
    .call([res, res.json]).next(res.json())
    .put(setSynchronized(wrap)).next()
    .isDone();
  })

  describe("upload ", ()=>{
    let saga, res = {
      ok: true,
      json: ()=>([])
    };
    beforeEach(()=>{
      saga = 
      testSaga(synchronizeProduct).next()
      .put(setSynchronized(false)).next()
      .select(getActiveProduct).next({name: "iris32-21", url: "192.168.1.4"})
      .select(getUncachedFiles).next([])
      .select(getConf).next({})
      .select(getItemsArray).next([])
      .select(getConfig).next({})
    })

    test("empty case", ()=>{
      saga
      .call(newSet, []).next(new Set())
      .call(abortableFetch, 'http://192.168.1.4/playlist', { method: 'GET' }).next(res)
      .call([res, res.json]).next(res.json())
      .put({ type: 'LOG_INFO',
        name: 'SYNC',
        message: '0 vidéo trouvée sur iris32-21',
        context: undefined }).next()
      .put({ type: 'LOG_INFO',
        name: 'SYNC',
        message: 'iris32-21 synchronisé',
        context: 'iris32-21 possédait déjà toutes les vidéos' }).next()
      .put(setSynchronized(true)).next()
      .isDone();
    })

    test("on empty product", ()=>{
      saga
      .call(newSet, []).next(newSet(["file:///applications/foo/foo.mp4"]))
      .call(abortableFetch, 'http://192.168.1.4/playlist', { method: 'GET' }).next(res)
      .call([res, res.json]).next(res.json())
      .put({ type: 'LOG_INFO',
        name: 'SYNC',
        message: '0 vidéo trouvée sur iris32-21',
        context: undefined }).next()
      .select(getHash, "file:///applications/foo/foo.mp4").next("xxxxxx")
      .call(abortableUpload, 'http://192.168.1.4', {
        uri: "file:///applications/foo/foo.mp4",
        name: "foo.mp4",
        hash: "xxxxxx",
      }).next(res)
      .put({ 
        type: 'LOG_INFO',
        name: 'SYNC',
        message: 'iris32-21 synchronisé',
        context: '1 vidéo synchronisée sur iris32-21' 
      }).next()
      .put(setSynchronized(true)).next()
      .isDone();
    })

    test("replacement", ()=>{
      let response = {
        ok: true,
        json: ()=>([{ name: "foo.mp4", /* no hash */}])
      }
      saga
      .call(newSet, []).next(newSet(["file:///applications/foo/foo.mp4"]))
      .call(abortableFetch, 'http://192.168.1.4/playlist', { method: 'GET' }).next(response)
      .call([response, response.json]).next(response.json())
      .put({ type: 'LOG_INFO',
        name: 'SYNC',
        message: '1 vidéo trouvée sur iris32-21',
        context: undefined }).next()
      .select(getHash, "file:///applications/foo/foo.mp4").next("xxxxxx")
      .put({ 
        type: 'LOG_INFO',
        name: 'SYNC',
        message: 'Suppression de la vidéo dupliquée foo.mp4',
        context: undefined 
      }).next()
      .call(abortableFetch, 'http://192.168.1.4/medias/foo.mp4', {method: "DELETE"}).next(res)
      .call(abortableUpload, 'http://192.168.1.4', {
        uri: "file:///applications/foo/foo.mp4",
        name: "foo.mp4",
        hash: "xxxxxx",
      }).next(res)
      .finish();
    })

    test("skip if up to date", ()=>{
      let response = {
        ok: true,
        json: ()=>([{ name: "foo.mp4", conf: {hash: "xxxxxx"}}])
      }
      saga
      .call(newSet, []).next(newSet(["file:///applications/foo/foo.mp4"]))
      .call(abortableFetch, 'http://192.168.1.4/playlist', { method: 'GET' }).next(response)
      .call([response, response.json]).next(response.json())
      .put({ type: 'LOG_INFO',
        name: 'SYNC',
        message: '1 vidéo trouvée sur iris32-21',
        context: undefined }).next()
      .select(getHash, "file:///applications/foo/foo.mp4").next("xxxxxx")
      .put({ type: 'LOG_INFO',
        name: 'SYNC',
        message: 'iris32-21 synchronisé',
        context: 'iris32-21 possédait déjà toutes les vidéos' }).next()
        .put(setSynchronized(true)).next()
        .isDone();
    })

    test("handle failure", ()=>{
      let videos = ["file:///applications/foo/foo.mp4"];
      let e = new TypeError("NetworkError when attempting to fetch resource");
      let wrap = new Error(`Failed to upload foo.mp4`);
      wrap.context = e.message+ "\n"+ e.stack;
  
      saga
      .call(newSet, []).next(newSet(videos))
      .call(abortableFetch, 'http://192.168.1.4/playlist', { method: 'GET' }).next(res)
      .call([res, res.json]).next(res.json())
      .put({ type: 'LOG_INFO',
        name: 'SYNC',
        message: '0 vidéo trouvée sur iris32-21',
        context: undefined }).next()
      .select(getHash, "file:///applications/foo/foo.mp4").next("xxxxxx")
      .call(abortableUpload, 'http://192.168.1.4', {
        uri: "file:///applications/foo/foo.mp4",
        name: "foo.mp4",
        hash: "xxxxxx",
      }).throw(e)
      .put({
        type: SET_SYNCHRONIZED,
        error: wrap,
      }).next()
      .isDone();
    })
  })

  describe("purge",()=>{
    let saga, videos;
    beforeEach(()=>{
      let res = {
        ok: true,
        json: ()=>([{
          "name": "foo.mp4",
        }])
      }
      videos = new Set();
      
      saga = testSaga(synchronizeProduct).next()
      .put(setSynchronized(false)).next()
      .select(getActiveProduct).next({name: "iris32-21", url: "192.168.1.4"})
      .select(getUncachedFiles).next([])
      .select(getConf).next({purge: true})
      .select(getItemsArray).next([])
      .select(getConfig).next({})
      .call(newSet, []).next(videos)
      .call(abortableFetch, 'http://192.168.1.4/playlist', { method: 'GET' }).next(res)
      .call([res, res.json]).next(res.json())
      .put({ type: 'LOG_INFO',
        name: 'SYNC',
        message: '1 vidéo trouvée sur iris32-21',
        context: undefined }).next()
      .put({ type: 'LOG_INFO',
        name: 'SYNC',
        message: 'iris32-21 synchronisé',
        context: 'iris32-21 possédait déjà toutes les vidéos' }).next()
    })

    test("delete unused files", ()=>{
      saga
      .call(getFilenames, videos).next(new Set())
      .call(abortableFetch, `http://192.168.1.4/medias/foo.mp4`, {method: "DELETE"} ).next()
      .put({
        type: "LOG_INFO",
        name: "SYNC",
        message: '1 ancienne vidéo supprimée',
        context: undefined,
      }).next()
      .put(setSynchronized(true)).next()
      .isDone();
    })
    test("keeps used items", ()=>{
      saga //Cheat a bit with getFilenames
      .call(getFilenames, videos).next(new Set(["foo.mp4"]))
      .put({
        type: "LOG_INFO",
        name: "SYNC",
        message: 'aucune ancienne vidéo supprimée',
        context: undefined,
      }).next()
      .put(setSynchronized(true)).next()
      .isDone();
    })
    test("handle fetch errors", ()=>{
      saga
      .call(getFilenames, videos).next(new Set([]))
      .call(abortableFetch, `http://192.168.1.4/medias/foo.mp4`, {method: "DELETE"} ).throw(new TypeError("NetworkError when attempting to fetch resource"))
      .put({
        type: "LOG_ERROR",            
        name: 'SYNC',
        message: 'Echec de la suppression de foo.mp4',
        context: undefined,
      }).next()
      .isDone();
    })
  })

})