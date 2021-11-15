'use strict';

import {base64ToHex, normalizeAngle} from "./convert";


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

describe("normalizeAngle()", function(){
    [
        [0, 0],
        [360, 0],
        [180, 180],
        [-180, 180],
        [-45, 315],
        [720, 0]
    ].forEach(function(f){
        test(`normalizeAngle(${f[0]}) == ${f[1]}`,function(){
            expect(normalizeAngle(f[0])).toBe(f[1]);
        })
    });
    [
        [0, 0],
        [2*Math.PI, 0],
        [-Math.PI, Math.PI],
    ].forEach(function(f){
        test(`normalizeAngle(${f[0]}, 2π) == ${f[1]}`,function(){
            expect(normalizeAngle(f[0], 2*Math.PI)).toBe(f[1],8);
        })
    });
})