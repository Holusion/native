import Store from "../../src/flux/store";
import { combineReducers } from "../../src/flux/reducer";

describe("Store", () => {
    it('init with two reducers', () => {
        const reduc1 = (state, action) => state;
        const reduc2 = (state, action) => state
        
        const reducer = combineReducers({reduc1, reduc2})
        const store = new Store(reducer);
        expect(store.reducer()).toMatchObject(reducer());
        expect(store.state).toBe(undefined);
        expect(store.listeners).toMatchObject([]);
    })

    describe(".dispatch", () => {
        it("dispatch and change state", () => {
            const reduc1 = (state={}, action) => action.reduc1 ? Object.assign({}, state, {reduc1: action.reduc1}) : state;
            const store = new Store(reduc1);
            
            store.dispatch({reduc1: "END"});
            expect(store.getState()).toMatchObject({reduc1: "END"})
        })

        it("when dispatch unmatch action", () => {
            const reduc1 = (state={reduc1: "INIT"}, action) => action.reduc1 ? Object.assign({}, state, {reduc1: action.reduc1}) : state;
            const store = new Store(reduc1);

            store.dispatch({foo: "bar"});
            expect(store.getState()).toEqual({reduc1: "INIT"})
        })

        it("when dispatch unmatch action with multiple reducers", () => {
            const reduc1 = (state="INIT_1", action) => action.reduc1 ? action.reduc1 : state;
            const reduc2 = (state="INIT_2", action) => action.reduc2 ? action.reduc2 : state;
            const store = new Store(combineReducers({reduc1, reduc2}));

            store.dispatch({foo: "bar"});
            expect(store.getState()).toEqual({reduc1: "INIT_1", reduc2: "INIT_2"})
        })

        it("when multiple reducers", () => {
            const reduc1 = (state="INIT_1", action) => action.reduc1 ? action.reduc1 : state;
            const reduc2 = (state="INIT_2", action) => action.reduc2 ? action.reduc2 : state;
            const store = new Store(combineReducers({reduc1, reduc2}));

            store.dispatch({reduc1: "END_1", reduc2: "END_2"});
            expect(store.getState()).toEqual({reduc1: "END_1", reduc2: "END_2"})
        })

        it('call listeners correctly', () => {
            const reduc1 = (state="INIT_1", action) => action.reduc1 ? action.reduc1 : state;
            const reduc2 = (state="INIT_2", action) => action.reduc2 ? action.reduc2 : state;
            const reducer = combineReducers({reduc1, reduc2});
            const store = new Store(reducer);
    
            let acc = 0;
            let actionSend = undefined;
            const listener1 = () => acc++;
            const listener2 = (action) => actionSend = action;
            const unsub1 = store.subscribe(listener1);
            const unsub2 = store.subscribe(listener2);
    
            store.dispatch({foo: "bar"});
            expect(actionSend).toMatchObject({foo: "bar"});
            expect(acc).toBe(1);
    
            unsub1();
            unsub2();
        })

        it('stop call listeners after unsubscribe', () => {
            const reduc1 = (state="INIT_1", action) => action.reduc1 ? action.reduc1 : state;
            const store = new Store(reduc1);
            
            let acc = 0;
            const listener1 = () => acc++;
            const unsub = store.subscribe(listener1);

            store.dispatch({foo: "bar"});
            expect(acc).toBe(1);

            unsub();

            store.dispatch({foo: "bar"});
            expect(acc).toBe(1);
        })
    })

    describe(".getState", () => {
        it("when no state change", () => {
            const reduc1 = (state={}, action) => state;
            const store = new Store(reduc1);
            
            expect(store.getState()).toEqual({})
        })
    })

    describe(".listenerAlreadyExists", () => {
        it("when listener is not register", () => {
            const reduc1 = (state, action) => state;
            const store = new Store(reduc1);
            const listener = (action) => 0;
            expect(store.listenerAlreadyExist(listener)).toBe(false);
        })

        it("when listener is register", () => {
            const reduc1 = (state, action) => state;
            const store = new Store(reduc1);
            const listener = (action) => 0;
            store.listeners = [listener];
            expect(store.listenerAlreadyExist(listener)).toBe(true);
        })
    })

    describe(".subscribe", () => {
        it("Subscribe a listener", () => {
            const reduc1 = (state, action) => state;
            const store = new Store(reduc1);
            const listener = (action) => 0;
            store.subscribe(listener);
            expect(store.listeners.length).toBe(1);
            expect(store.listeners).toContain(listener)
        })

        it("Unsubscribe a listener", () => {
            const reduc1 = (state, action) => state;
            const store = new Store(reduc1);
            const listener = () => 0;
            const unsubscribe = store.subscribe(listener);
            expect(store.listeners.length).toBe(1);
            unsubscribe();
            expect(store.listeners.length).toBe(0);
            expect(store.listeners).not.toContain(listener)
        })

        it("Check if listener already subscribed", () => {
            const reduc1 = (state, action) => state;
            const store = new Store(reduc1);
            const listener = () => 0;
            store.subscribe(listener);
            store.subscribe(listener);
            expect(store.listeners.length).toBe(1)
            expect(store.listeners).toContain(listener)
        })

        it("Try to add a wrong listener", () => {
            const reduc1 = (state, action) => state;
            const store = new Store(reduc1);
            const listener = "foo";
            store.subscribe(listener);
            expect(store.listeners.length).toBe(0)
        })
    })
})