'use strict';

import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import fs from "filesystem";

import { LOG_INFO, LOG_WARN, info, reducers} from "..";


import { CLEAN_CACHE, cleanCache } from './clean';
import { getCache, getFiles, unsetHash } from './actions';
import { select } from 'redux-saga/effects';
import { throwError } from 'redux-saga-test-plan/providers';

const fakeFile = (name)=>({
  src: `gs://holomouseio.appspot.com/applications/foo/${name}`,
  dest: `/tmp/${name}`,
  hash: 'Tx7dNJNSciuqtLjqSe3OSw==',
  contentType: 'image/webp',
  size: 697382
})

describe("cleanCache", function () {

  test("can delete an unused file", async ()=>{
    await expectSaga(cleanCache)
    .provide([
      [select(getCache), {
        '/tmp/used.webp': 'Tx7dNJNSciuqtLjqSe3OSw==',
        '/tmp/unused.webp': '4TphQIFWnBdQVZvLCkjxMA==',
      }],
      [select(getFiles), {
        '/tmp/used.webp': fakeFile("used.webp"),
      }],
      [matchers.call.fn(fs.unlink, "/tmp/unused.webp"), undefined]
    ])
    .not.call(fs.unlink, '/tmp/used.webp')
    .call(fs.unlink, '/tmp/unused.webp')
    .put(unsetHash("/tmp/unused.webp"))
    .put(info(CLEAN_CACHE, 'cache nettoyé (1 fichiers supprimés)'))
    .run();
  });

  test("handles ENOENT on unlink", async ()=>{
    const e = new Error("ENOENT No such file or directory: /tmp/unused.webp");
    e.code = "ENOENT";
    await expectSaga(cleanCache)
    .provide([
      [select(getCache), {
        '/tmp/used.webp': 'Tx7dNJNSciuqtLjqSe3OSw==',
        '/tmp/unused.webp': '4TphQIFWnBdQVZvLCkjxMA==',
      }],
      [select(getFiles), {
        '/tmp/used.webp': fakeFile("used.webp"),
      }],
      [matchers.call.fn(fs.unlink, "/tmp/unused.webp"), throwError(e)]
    ])
    .call(fs.unlink, '/tmp/unused.webp')
    .put(unsetHash("/tmp/unused.webp"))
    .put(info(CLEAN_CACHE, 'cache nettoyé (1 fichiers supprimés)'))
    .run()
  });

  test("handles EPERM on unlink", async ()=>{
    const e = new Error("EPERM: operation not permitted, unlink '/tmp/unused.webp'");
    e.code = "EPERM";
    await expectSaga(cleanCache)
    .provide([
      [select(getCache), {
        '/tmp/used.webp': 'Tx7dNJNSciuqtLjqSe3OSw==',
        '/tmp/unused.webp': '4TphQIFWnBdQVZvLCkjxMA==',
      }],
      [select(getFiles), {
        '/tmp/used.webp': fakeFile("used.webp"),
      }],
      [matchers.call.fn(fs.unlink, "/tmp/unused.webp"), throwError(e)]
    ])
    .call(fs.unlink, '/tmp/unused.webp')
    .not.put(unsetHash("/tmp/unused.webp"))
    .put.like({action:{type: LOG_WARN, name: 'CLEAN_CACHE'}})
    .run()
  });
});
