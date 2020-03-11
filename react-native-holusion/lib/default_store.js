'use strict';

import {initialize, signIn, watchFiles, saveDataFileSerial} from "./files";
import {setData, setFirebaseInfo} from "./actions";

import {getUniqueId, getApplicationName, getDeviceName} from "react-native-device-info";

import { createStore } from 'redux'
import reducers from "./reducers";
export {createStore};
export default function configureStore({projectName}={}){
    const initialState = reducers(undefined, {});
    if(typeof projectName !== "undefined")
        initialState.data.projectName = projectName;
    return createStore(reducers, initialState);
};

export class StoreWrapper{
    constructor({projectName}= {}){
        this._projectName = projectName;
        this._store = configureStore({projectName});
        this._authenticated = false;
    }

    get projectName(){return this._projectName}
    get authenticated(){return this._authenticated}

    get store(){return this._store}
    async watch(onChange){
        await this.init(onChange)
        this._unwatch = await watchFiles({
            projectName: this.projectName,
            onUpdate:()=>{
                this.store.dispatch(setFirebaseInfo("loading"));
            },
            onProgress: (...messages) => {
                console.warn("watchFiles Progress : ", messages);
                onChange({severity: "info", message: messages.join(" ")})
            }, 
            dispatch: (data)=>{
                this.store.dispatch(setData(data));
                this.store.dispatch(setFirebaseInfo("connected"));
            },
        });

    }
    unwatch(){
        if(this._unwatch){
            this._unwatch();
            this._unwatch = null;
        }
    }
    init(onChange){
        if(this._init) return this._init;
        return this._init = initialize()
        .then((data)=>{
            this.store.dispatch(setData(data));
        })
        .then(()=>{

            this.data = this.store.getState().data;
            this.dataStr = JSON.stringify(this.data);
            this.store.subscribe(()=>{
                const new_state = this.store.getState();
                if(new_state.data === this.data) return;
                const new_dataStr = JSON.stringify(new_state.data);
                if(new_dataStr!== this.dataStr){
                    saveDataFileSerial(new_dataStr)
                    .then(()=>console.warn("Local data saved"))
                    .catch((e)=>{
                        onChange("Failed to save data : "+ e.message);
                    })
                }
                this.dataStr = new_dataStr;
                this.data = new_state.data;
            })
        })
        .catch(e=>{
            console.warn("Impossible d'initialiser l'application hors ligne : ", e.message);
            onChange({severity: "info", message: "pas de données locales."});
            return;
        })
        .then(()=> getDeviceName())
        .then((hostname) =>  signIn(getUniqueId(), [this.projectName], {publicName:`${getApplicationName()}.${hostname}`}))
        .then(res=> {
            this.store.dispatch(setFirebaseInfo("connected"));
            console.warn("Authentication success : ", res)
            this._authenticated = true;
        })
        .catch((e)=>{
            let err = new Error("Authentication error : "+e.message);
            err.code = "authentication-failed";
            throw err;
        })
    }
}