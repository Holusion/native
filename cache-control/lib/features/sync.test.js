
import {testSaga} from "redux-saga-test-plan";
import { getConf } from "./conf";
import { getConfig, getItemsArray } from "./data";
import { getUncachedFiles } from "./files";
import { getActiveProduct } from "./products";
import { setSynchronized } from "./status";
import {synchronizeProduct, abortableFetch} from "./sync";


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
  test("handle error if playlist can not be fetched", ()=>{
    let res = {
      ok: false,
      json: ()=>({message: "Internal Error", code: 500})
    }

    let wrap = new Error(`Echec de l'envoi des vidéos au produit`);

    testSaga(synchronizeProduct).next()
    .put(setSynchronized(false)).next()
    .select(getActiveProduct).next({name: "iris32-21", url: "192.168.1.4"})
    .select(getUncachedFiles).next([])
    .select(getConf).next({})
    .select(getItemsArray).next([])
    .select(getConfig).next({})
    .call(abortableFetch, 'http://192.168.1.4/playlist', { method: 'GET' }).next(res)
    .call([res, res.json]).next(res.json())
    .put(setSynchronized(wrap)).next()
    .isDone();
  })
  test("handle empty case", ()=>{
    let res = {
      ok: true,
      json: ()=>([])
    }
    testSaga(synchronizeProduct).next()
    .put(setSynchronized(false)).next()
    .select(getActiveProduct).next({name: "iris32-21", url: "192.168.1.4"})
    .select(getUncachedFiles).next([])
    .select(getConf).next({})
    .select(getItemsArray).next([])
    .select(getConfig).next({})
    .call(abortableFetch, 'http://192.168.1.4/playlist', { method: 'GET' }).next(res)
    .call([res, res.json]).next(res.json())
    .put({ type: 'LOG_INFO',
      name: 'SYNC',
      message: '0 vidéos trouvées sur iris32-21',
      context: undefined }).next()
    .put({ type: 'LOG_INFO',
      name: 'SYNC',
      message: 'iris32-21 synchronisé',
      context: 'iris32-21 possédait déjà toutes les vidéos' }).next()
    .put(setSynchronized(true)).next()
    .isDone();
  })
})