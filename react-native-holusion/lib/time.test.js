'use strict';

import {Accumulator} from "./time";

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
    test("will call handler after a pre-set delay (1)", function(done){
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
    test("will call handler after a pre-set delay (2)", function(done){
        const handleChange = jest.fn();
        let a = new Accumulator({handleChange, backoff: 10});
        setTimeout(()=>{
            expect(handleChange).toHaveBeenCalledTimes(1);
            expect(handleChange).toHaveBeenNthCalledWith(1, 2);
            done();
        }, 20);
        a.add(1);
        setTimeout(()=> a.add(1), 5);
        jest.runAllTimers();
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