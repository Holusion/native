'use strict';

import {onUpdate} from "../lib/netScan";

import configureStore from "../lib/default_store";
import {addProduct, setData} from "../lib/actions";

describe("netScan onUpdate",function(){
    let unsubscribe, store;
    beforeEach(function(){
        store = configureStore();
        unsubscribe = store.subscribe(()=>onUpdate(store));
    })
    afterEach(()=>unsubscribe());
    it("Finds default product",function(done){
        store.dispatch(setData({config:{default_target:"foo"}}));
        store.dispatch(addProduct({name:"foo"}))
        setTimeout(()=>{
            const {products} = store.getState();
            const active = products.find((p)=>p.active);
            expect(active).toBe.ok;
            done();
        }, 1)
    })
})
