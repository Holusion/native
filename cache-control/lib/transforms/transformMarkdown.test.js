'use strict';
import {resolve} from "path";
import fs from "fs";


// get usefull mocks
jest.mock("../path", () => ({
  mediasPath: () => "/tmp/makeLocal-tests",
  filename: () => { },
}));


import {matchImages, transformMarkdownFactory, searchAndReplace} from "./transformMarkdown";

let fixtures = {}

const dir = resolve(__dirname, "__fixtures__")
const files = fs.readdirSync(dir);
for (let file of files){
  fixtures[file.split(".").slice(0, -1).join(".")] = fs.readFileSync(resolve(dir, file), {encoding: "utf-8"});
}

test("make fixtures object", ()=>{
  expect(Object.keys(fixtures).length).toBeTruthy();
})

describe("matchImages", ()=>{
  test("match simple case of image-in-markdown", ()=>{
    const cb = jest.fn();
    for(let m of matchImages("![alt text](foo.png)")){
      cb(m);
    }
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenNthCalledWith(1, expect.objectContaining({
      index: 0,
      groups: {
        filename: "foo.png", 
        optionalPart: undefined
      }
    }))
  })
})

describe("searchAndReplace()", ()=>{
  Object.keys(fixtures).forEach((name)=>{
    let [, inputChunk, outputChunk, filesChunk] = fixtures[name].split("---\n");
    let files = new Set(filesChunk.split("\n").filter(f=>f));
    test(name, ()=>{
      expect(searchAndReplace(inputChunk, "bar")).toEqual([
        outputChunk,
        files
      ]);
    })
  })
})

describe("parseMarkdown()", ()=>{
  test("Handle mainText field", ()=>{
    let fn = transformMarkdownFactory("baz");
    expect(fn({mainText: "![](foo.png)"})).toEqual([
      {mainText: "![](file:///tmp/makeLocal-tests/foo.png)"},
      new Set(["gs://example.com/applications/baz/foo.png"])
    ])
  })
})