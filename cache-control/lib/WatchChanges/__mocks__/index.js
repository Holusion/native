import {EventEmitter} from "events";


export class WatchChanges extends EventEmitter{
  constructor(){
    super();
    this.watch = jest.fn();
    this.close = jest.fn();
  }
}