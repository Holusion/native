import reducers from ".";

describe("reducers", function(){
  test("initializes reducers with default state", ()=>{
    expect(typeof reducers).toBe("function");
    expect(reducers(undefined, {})).toMatchSnapshot();
  })
})