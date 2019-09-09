'use strict';

import {base64ToHex} from "../lib/convert";


describe("base64ToHex()",function(){
    [
        ["W26fHhyFCumUVVAOTjkoVg", "5B6E9F1E1C850AE99455500E4E392856"],
        ["lmVVkDFF8kJzWFaYPkMWmQ", "966555903145F242735856983E431699"]
    ].forEach(f=>{
        test(`${f[0]} => ${f[1]}`,function(){
            expect(base64ToHex(f[0])).toBe(f[1]);
        })
    })
})
