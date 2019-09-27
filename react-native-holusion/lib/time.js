'use strict';

export const delay = (t)=> new Promise((r)=>setTimeout(r, t));

export class Accumulator{
    constructor({backoff=0, handleChange, reset=false}={}){
        this.backoff = backoff;
        this.handleChange = handleChange;
        this._changed = false;
        this._acc = 0;
        this.reset = reset;
    }

    set(val){
        this._changed = true;
        this._acc = val;
        this.backoffHandle();
    }

    add(val){
        this._changed = true;
        this._acc += val;
        this.backoffHandle();
    }

    backoffHandle(){
        setTimeout(()=>{
            if(! this._changed){
                return;
            }
            this.handleChange(this._acc);
            this._changed = false;
            if( this.reset ) this._acc = 0;
        }, this.backoff);
    }
}