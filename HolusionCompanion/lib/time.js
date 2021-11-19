'use strict';
/**
 * Promisified setTimeout
 * @param {number} t - timeout in ms 
 */
export const delay = (t)=> new Promise((r)=>setTimeout(r, t));

/**
 * Accumulate changes to fire an update no more than once every "backoff" ms
 */
export class Accumulator{
    /**
     * 
     * @param {*} param0 
     * @param {number} param0.backoff - the min delay between handleChange calls
     * @param {callback} handleChange - Callback being called with the accumulated value
     * @param {boolean} [reset=false] - reset accumulated value after calling handleChange
     */
    constructor({backoff=0, handleChange, reset=false}={}){
        this.backoff = backoff;
        this.handleChange = handleChange;
        this._changed = false;
        this._acc = 0;
        this.reset = reset;
    }
    /**
     * Overwrite accumulated value
     * @param {*} val 
     */
    set(val){
        this._changed = true;
        this._acc = val;
        this._backoffHandle();
    }
    /**
     * Add val to accumulator
     * @param {*} val - value to accumulate. Must support += operator
     */
    add(val){
        this.set(this._acc + val);
    }
    /**
     * Internal mechanism to handle callback with backoff
     */
    _backoffHandle(){
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