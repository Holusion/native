'use strict';
import { setActive, addProduct, removeProduct, setProducts } from "../actions";
import reducers from ".";
import { getActiveProduct } from "../selectors";



describe("reducers", function () {
  const initialState = reducers(undefined, {});
  const initialStateCopy = Object.assign({}, initialState);
  afterEach(function () {
    //Be sure state is never mutated, because const doesn't ensure this.
    expect(initialState).toEqual(initialStateCopy);
  })
  describe("products", function () {
    test("product list starts empty", function () {
      expect(initialState).toHaveProperty("products");
      expect(initialState.products).toBeInstanceOf(Array);
      expect(initialState.products).toHaveProperty("length", 0);
    })
    test("can add a product", function () {
      const { products } = reducers(initialState, addProduct({ name: "foobar" }));
      expect(products).toHaveProperty("length", 1);
    })
    test("can add a product twice", function () {
      const state = reducers(initialState, addProduct({ name: "foobar", active: true }));
      const { products } = reducers(state, addProduct({ name: "foobar", active: false }));
      expect(products).toHaveProperty("length", 1);
      expect(products[0]).toHaveProperty("active", false);
    })
    test("can remove a product with its name ", function () {
      const s = reducers(initialState, addProduct({ name: "foobar" }));
      const { products } = reducers(s, removeProduct("foobar"));
      expect(products).toHaveProperty("length", 0);
    })
    test("can remove a product with its object", function () {
      const p = { name: "foobar" };
      const s = reducers(initialState, addProduct(p));
      const { products } = reducers(s, removeProduct(p));
      expect(products).toHaveProperty("length", 0);
    })
    test("can set and unset an active product", function () {
      const p = { name: "foobar" };
      let s = reducers(initialState, addProduct(p));
      s = reducers(s, setActive(p));
      expect(s.products).toEqual([{ name: "foobar", active: true }])
      s = reducers(s, setActive());
      expect(s.products).toEqual([{ name: "foobar", active: false }])
    })
    test("can set active product by name", function(){
      const p = { name: "foobar" };
      let s = reducers(initialState, addProduct(p));
      s = reducers(s, setActive("foobar"));
      expect(s.products).toEqual([{ name: "foobar", active: true }])
    })
    test("can overwrite all products", function(){
      let s = reducers(initialState, setProducts([]));
      expect(s.products).toEqual([]);
      s = reducers(s, setProducts([{name: "foo", url: "192.168.1.2"}]));
      expect(s.products).toEqual([{name: "foo", url: "192.168.1.2"}]);
    });
    describe("getActiveProduct()", function () {
      let state;
      beforeEach(function () {
        state = reducers(initialState, addProduct({ name: "foo" }));
        state = reducers(state, addProduct({ name: "bar" }));
        state = reducers(state, addProduct({ name: "baz" }));
      })
      test("no default", function () {
        expect(getActiveProduct(state)).not.toBeTruthy();
      })
      test("can get active product", function () {
        state = reducers(state, setActive({ name: "bar" }));
        expect(getActiveProduct(state)).toEqual({ name: "bar", active: true });
      })
    })
  })
})
