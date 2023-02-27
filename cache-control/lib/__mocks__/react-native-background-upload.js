import {EventEmitter} from "events";
let ids = 0;

let _ = new EventEmitter();

export default {
  startUpload: jest.fn(function(){
    let id = ++ids;
    setTimeout(()=>this._getResponse(id), 1);
    return Promise.resolve(id);
  }),
  addListener: jest.fn((name, id, cb)=>{
    _.on(name+"-"+id, cb);
    return {
      remove: ()=>_.off(name+"-"+id, cb),
    }
  }),
  cancelUpload: jest.fn((id)=>{
    _.emit("cancelled-"+id);
  }),
  _completed: (id)=> _.emit("completed-"+id),
  _getResponse: jest.fn(),
  _: _,
}