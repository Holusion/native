'use strict';
import {setNetInfo, setData} from "../src/actions";
import reducers from "../src/reducers";

describe("test reducers", function(){
    const initialState = reducers(undefined,{});
    const initialStateCopy = Object.assign({}, initialState);
    afterEach(function(){
        //Be sure state is never mutated, because const doesn't ensure this.
        expect(initialState).toEqual(initialStateCopy);
    })
    describe("network",function(){
        test('network starts as offline',function(){
            expect(initialState).toHaveProperty("network");
            expect(initialState.network).toHaveProperty("status", "offline");
        })
        test("setNetInfo() changes network status", function(){
            const s = reducers(initialState, setNetInfo("online"));
            expect(s.network).toHaveProperty("status", "online");
        })
    })
    describe("products", function(){
        test("product list starts empty", function(){
            expect(initialState).toHaveProperty("products");
            expect(initialState.products).toBeInstanceOf(Array);
            expect(initialState.products).toHaveProperty("length", 0);
        })
    })
    describe("data",function(){
        test("can set data", function(){
            const d = {foo:{name:"foo", status: "bar"}};
            const s = reducers(initialState, setData(d));
            expect(s.data).toEqual(d);
        })
    })
})