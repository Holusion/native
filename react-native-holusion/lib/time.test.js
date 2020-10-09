'use strict';

import {delay, Accumulator} from "./time";
describe("delay", function(){
    beforeEach(()=> jest.useFakeTimers())
    afterEach(()=> jest.clearAllTimers())
    //Dummy tests
    test("uses promisified setTimeout", (done)=>{
        delay(10).then(()=>done());
        jest.advanceTimersByTime(10);
    });
})
describe("Accumulator", function(){
    beforeEach(()=> jest.useFakeTimers())
    afterEach(()=> jest.clearAllTimers())
    test("accumulates changes before calling handler", function(done){
        let a = new Accumulator();
        a.handleChange = function(val){
            expect(val).toBe(2);
            done();
        }
        a.add(1);
        a.add(1);
        jest.runAllTimers();
    })
    test("will call handler", function(done){
        const handleChange = jest.fn();
        let a = new Accumulator({handleChange});
        setTimeout(()=>{
            expect(handleChange).toHaveBeenCalledTimes(2);
            expect(handleChange).toHaveBeenNthCalledWith(1, 1);
            expect(handleChange).toHaveBeenNthCalledWith(2, 2);
            done();
        }, 20);
        a.add(1);
        setTimeout(()=> a.add(1), 5);
        jest.runAllTimers();
    })
    test("will debounce handler calls", function(){
        const handleChange = jest.fn();
        let a = new Accumulator({handleChange, backoff: 10});
        a.add(1);
        jest.advanceTimersByTime(5);
        expect(handleChange).toHaveBeenCalledTimes(0);
        a.add(1);
        jest.advanceTimersByTime(5);
        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenNthCalledWith(1, 2);
        jest.runAllTimers();
        expect(handleChange).toHaveBeenCalledTimes(1);
    })
    test("can use set() to re-set value", function(){
        const handleChange = jest.fn();
        let a = new Accumulator({handleChange, backoff: 10});
        a.set(2);
        jest.advanceTimersByTime(5);
        expect(handleChange).toHaveBeenCalledTimes(0);
        a.set(1);
        jest.advanceTimersByTime(5);
        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenNthCalledWith(1, 1);
        jest.runAllTimers();
        expect(handleChange).toHaveBeenCalledTimes(1);
    })
    test("can auto-reset", function(done){
        let a = new Accumulator({reset: true});
        a.handleChange = function(val){
            expect(val).toBe(2);
            setImmediate(()=>{
                expect(a._acc).toBe(0);
                done();
            });
        }
        a.add(1);
        a.add(1);
        jest.runAllTimers();
    })
})