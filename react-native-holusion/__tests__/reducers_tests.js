'use strict';
import {setNetInfo, setData, setActive, addProduct, removeProduct} from "../lib/actions";
import reducers from "../lib/reducers";

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
        test("can add a product",function(){
            const {products} = reducers(initialState, addProduct({name:"foobar"}));
            expect(products).toHaveProperty("length", 1);
        })
        test("can remove a product with its name ", function(){
            const s = reducers(initialState, addProduct({name:"foobar"}));
            const {products} = reducers(s, removeProduct("foobar"));
            expect(products).toHaveProperty("length", 0);
        })
        test("can remove a product with its object", function(){
            const p = {name:"foobar"};
            const s = reducers(initialState, addProduct(p));
            const {products} = reducers(s, removeProduct(p));
            expect(products).toHaveProperty("length", 0);
        })
        test("can set an active product",function(){
            const p = {name:"foobar"};
            let s = reducers(initialState, addProduct(p));
            s = reducers(s, setActive(p));
            expect(s.products).toEqual([{name: "foobar", active: true}])
        })
    })
    describe("data",function(){
        test("can set data", function(){
            const d = {items:{foo:{name:"foo", status: "bar"}}, projectName:"foo", selectedId: "foo", config: {}};
            const s = reducers(initialState, setData(d));
            expect(s.data).toHaveProperty("items", {foo:{name:"foo", status: "bar"}});
            expect(s.data).toHaveProperty("projectName","foo");
            expect(s.data).toHaveProperty("selectedId","foo");
        })
        test("can set only selected keys of data", function(){
            const d = {items:{foo:{name:"foo", status: "bar"}}};
            const s = reducers(initialState, setData(d));
            expect(s.data.items).toEqual(d.items);
            expect(s.data).toHaveProperty("config",{});
        })
    })
})