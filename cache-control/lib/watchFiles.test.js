

import {onConfigSnapshot} from "./watchFiles";

describe("watchFiles", function(){

  describe("onConfigSnapshot", function(){
    let logMock;
    
    beforeAll(()=>{
      logMock = jest.spyOn(global.console, "log");
      logMock.mockImplementation(()=>{});
    })
    
    afterAll(()=>{
      logMock.mockRestore();
    });
  
    it("emits a warning if config snapshot does not exist", async ()=>{
      const dispatch = jest.fn();
      const warnMock = jest.spyOn(global.console, "warn");
      warnMock.mockImplementationOnce(()=>{});
      await expect(onConfigSnapshot({exists: false}, {dispatch})).resolves.toBeUndefined();
      expect(warnMock).toHaveBeenCalledTimes(1);
      warnMock.mockRestore();
  
      expect(dispatch).toHaveBeenCalledWith({config: {categories: []}});
    });
  
  })
})
