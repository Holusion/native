
import {addTask, removeTask, ADD_TASK, REMOVE_TASK} from "./actions";

describe("actions", ()=>{
  describe("addTask", ()=>{
    it("creates a task", function(){
      expect(addTask({id:"foo", title: "cleanup", status: "pending"})).toEqual({
        type: ADD_TASK,
        id: "foo",
        title: "cleanup",
        status: "pending",
      });
    })

    it("set title = id if not provided", function(){
      expect(addTask({id:"foo", status: "done"})).toEqual({
        type: ADD_TASK,
        id: "foo",
        title: "foo",
        status: "done",
      });
    })

    it("set status = pending if not provided", function(){
      expect(addTask({id:"foo"})).toEqual({
        type: ADD_TASK,
        id: "foo",
        title: "foo",
        status: "pending",
      });
    })
  })

  describe("removeTask", function(){
    it("throw an error if not provided an ID", function(){
      expect(()=>removeTask({})).toThrow();
    })
    it("return the task's id", function(){
      expect(removeTask("foo")).toEqual({type: REMOVE_TASK, id: "foo"});
    })
  })
})