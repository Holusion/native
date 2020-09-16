
//Simply check if index can be imported
import * as m from "../index";

describe("main module", function(){
  it("has DownloadProvider", function(){
    expect(m).toHaveProperty("DownloadProvider");
  });
})