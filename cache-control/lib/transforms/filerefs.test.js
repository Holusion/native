'use strict';

import { firebase } from "firebase";

import {parseLink} from "./filerefs";

jest.mock("../path", () => ({
  mediasPath: () => "/tmp/filerefs-test"
}));

describe("parseLink()", ()=>{
  let getMetadata, refFromURL, ref;

  beforeAll(() => {
    firebase._reset();
  });

  afterEach(() => {
  });

  test("takes a gs:// URI", ()=>{
    expect(parseLink("gs://example.com/applications/foo/foo.png", "foo")).toEqual([
      "gs://example.com/applications/foo/foo.png",
      "file:///tmp/filerefs-test/foo.png",
    ])
  })
  test("takes an absolute link URI", ()=>{
    expect(parseLink("foo.png", "foo")).toEqual([
      "gs://example.com/applications/foo/foo.png",
      "file:///tmp/filerefs-test/foo.png",
    ])
  });
  test("throws an error if used improperly", ()=>{
    expect(()=>parseLink("foo.png" /* no project specified*/)).toThrow();
  })
})