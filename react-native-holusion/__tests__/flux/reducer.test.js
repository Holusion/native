import { combineReducers } from "../../src/flux/reducer";

expect.extend({
    toBeType(received, argument) {
        const initType = typeof received;
        const type = initType === "object" ? Array.isArray(received) ? "array" : initType : initType
        return type === argument ? {
            message: () => `expected ${received} to be type ${argument}`,
            pass: true
        } : {
            message: () => `expected ${received} to be type ${argument}`,
            pass: false
        }
    }
})

describe(".combineReducers", () => {
    it("with one reducer", () => {
        const reduc1 = (state="INIT", action) => state;
        
        const actual = combineReducers({reduc1});
        const expected = {reduc1: "INIT"}
        expect(actual).toBeType("function")
        expect(actual()).toMatchObject(expected);
    })

    it('change state of one reducer', () => {
        const reduc1 = (state="INIT", action) => state;

        const actual = combineReducers({reduc1});
        const expected = {reduc1: "END"}
        expect(actual).toBeType("function")
        expect(actual({reduc1: "END"})).toMatchObject(expected);
    })

    it('should throw when reducer is a string', () => {
        const reduc1 = "wrong reducer";
        try {
            combineReducers({reduc1})
            fail(new Error(`Should throw a TypeError`))
        } catch(e) {
            expect(e instanceof TypeError).toBe(true);
        }
    })

    it("with multiple reducer", () => {
        const reduc1 = (state="INIT_1", action) => state;
        const reduc2 = (state="INIT_2", action) => state;

        const actual = combineReducers({reduc1, reduc2});
        const expected = {reduc1: "INIT_1", reduc2: "INIT_2"};
        expect(actual).toBeType("function");
        expect(actual()).toMatchObject(expected);
    })

    it("only specific reducer change", () => {
        const reduc1 = (state="INIT_1", action) => state;
        const reduc2 = (state="INIT_2", action) => state;

        const actual = combineReducers({reduc1, reduc2});
        const expected = {reduc1: "END", reduc2: "INIT_2"};
        expect(actual).toBeType("function");
        expect(actual({reduc1: "END"})).toMatchObject(expected);
    })
})